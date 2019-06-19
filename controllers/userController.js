const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
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

    return User.findByPk(req.params.id, {
      include:
        { model: Comment, include: [Restaurant] }
    })
      .then(user => {

        return res.render('profile', { profile: user })
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
  }
}

module.exports = userController