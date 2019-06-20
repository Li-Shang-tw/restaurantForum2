const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  //註冊
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  //登入
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  //個人資料
  //瀏覽頁面
  getUser: (req, res) => {
    const duplicatedRestaurants = []//創個空陣列來裝備評論的餐廳陣列
    const userId = req.user.id
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
      ]
    })
      .then(user => {

        //ㄧ.去除評論過的餐廳array中重複的餐廳
        const commentArray = user.Comments //取出所有的評論陣列
        //
        commentArray.forEach(element => {//由評論陣列搜索並拉出被評論過的餐廳物件
          duplicatedRestaurants.push(element.Restaurant.dataValues)//將被評論過的餐廳物件裝進 duplicatedRestaurants (有重複)
        });
        //得到沒重複的餐廳陣列
        //1.JSON.stringify(item) 將重複的餐廳陣列中的餐廳物件轉成字串，以利set判斷是否重複 
        //2.set去除重複的餐廳物件(現在是字串)，得出沒重複的餐廳陣列(但內含物為字串)
        //3.item => JSON.parse 將內含物從字串轉回物件         
        const UnduplicatedRestaurants = [...new Set(duplicatedRestaurants.map(item => JSON.stringify(item)))].map(item => JSON.parse(item))
        //二.判斷user是否已追蹤
        user.isFollowed = req.user.Followings.map(d => d.id).includes(user.id)


        console.log(user.isFollowed)
        return res.render('profile', { profile: user, Commentedrestaurants: UnduplicatedRestaurants, userId: userId })
      })
  },
  editUser: (req, res) => {
    //在別人的profile頁面，頁面的id和local variable的id不同
    if (Number(req.params.id) !== Number(req.user.id)) {
      req.flash('error_messages', '你無法編輯其他人的profile！')
      return res.redirect(`/users/${req.params.id}`)
    }

    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('profileEdit', { user: user })
      })

  },

  putUser: (req, res) => {
    //在別人的profile頁面，頁面的id和local variable的id不同
    if (Number(req.params.id) !== Number(req.user.id)) {
      req.flash('error_messages', '你無法編輯其他人的profile！')
      return res.redirect(`/users/${req.params.id}`)
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: img.data.link
            }).then((user) => {
              res.redirect(`/users/${req.params.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name
          }).then((user) => {
            res.redirect(`/users/${req.params.id}`)
          })
        })
    }
  },
  //favorite
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurants => {
        res.redirect('back')
      })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(Like => {
        Like.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }//找粉絲
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController