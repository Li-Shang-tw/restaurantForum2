const db = require('../models')
const Restaurant = db.Restaurant
const Comment = db.Comment
const User = db.User
const Category = db.Category
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
        description: r.dataValues.description.substring(0, 50)
      }))
      Category.findAll().then(categories => { // 取出 categoies 
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId/*在active的部分會用到 */,
          page: page,
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
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {

      return res.render('restaurant', {
        restaurant: restaurant
      })
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

}
module.exports = restController