const db = require('../models')
const Restaurant = db.Restaurant
const Comment = db.Comment
const User = db.User
const Category = db.Category
const Favorite = db.Favorite
const pageLimit = 10


let restController = {
  getRestaurants: (req, res) => {

    let whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['categoryId'] = categoryId
    }
    //用categoryId篩選
    Restaurant.findAndCountAll({ include: Category, where: whereQuery/*若沒被點選，whereQuery為{} 可忽略*/, offset: offset, limit: pageLimit }).then(result => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      //////////////////////////////////////      
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        //在data中新增isFavorited 和 isLiked，不存在於資料庫
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),//傳回true /false
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)//傳回true /false
      }))
      Category.findAll().then(categories => { // 取出 categoies 
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,/*在active的部分會用到 */
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      restaurant.update({
        viewCounts: restaurant.viewCounts + 1
      })
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      return res.render('restaurant', { restaurant: restaurant, isFavorited: isFavorited, isLiked: isLiked })

    })
  },
  //detail dashboard
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      console.log(restaurant)
      return res.render('dashboard', {
        restaurant: restaurant
      })
    })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createAt', 'DESC']],
      include: [Category]
    })
      .then(restaurants =>
        Comment.findAll({
          limit: 10,
          order: [['createAt', 'DESC']],
          include: [User, Restaurant]
        }))
      .then(comments => {
        return res.render('feeds', {
          restaurants: restaurants,
          comments: comments
        })
      })
  },

  //top 10 restaurants
  getTopRestaurants: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      include: [{
        model: User, as: 'FavoritedUsers'
      }]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        //計算追蹤人數
        FavoriteCount: restaurant.FavoritedUsers.length,
        //紀錄是否追蹤過
        isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)

      }))
      restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount)
      res.render('topRestaurants', { restaurants: restaurants })
    })
  }

}
module.exports = restController