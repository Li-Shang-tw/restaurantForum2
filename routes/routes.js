const express = require('express')
const router = express.Router()
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController.js')
const passport = require('../config/passport')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })





//加入權限驗證
const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

//註冊與登入
//註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

//登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)//用passport驗證
router.get('/logout', userController.logout)

//首頁導向restaurants
router.get('/', authenticated, (req, res) => {
  res.redirect('/restaurants')
})
//列出所有restaurants的頁面
router.get('/restaurants', authenticated, restController.getRestaurants)

//feeds
router.get('/restaurants/feeds', authenticated, restController.getFeeds)

//top 10 restaurants
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)

//detail
router.get('/restaurants/:id', authenticated, restController.getRestaurant)

//detail dashboard
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)


//comment
//新增
router.post('/comments', authenticated, commentController.postComment)


//top10 users
router.get('/users/top', authenticated, userController.getTopUser)
//follow
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)



//profile
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

//admin首頁導向restaurants
router.get('/admin', authenticatedAdmin, (req, res) => {
  res.redirect('/admin/restaurants')
})
//列出所有restaurants的頁面
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

//admin的CRUD路由
//Create
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
//Read
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
//Upgrade
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
//Delete
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

//edit user's admin
router.get('/admin/users', authenticatedAdmin, adminController.editUser)
router.put("/admin//users/:id", authenticatedAdmin, adminController.putUser)

//category
//瀏覽所有categories
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
//新增
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

//edit
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)  //修改頁面

router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

//delete
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

//favorite 
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

//like
router.post('/Like/:restaurantId', authenticated, userController.addLike)
router.delete('/Like/:restaurantId', authenticated, userController.removeLike)


module.exports = router