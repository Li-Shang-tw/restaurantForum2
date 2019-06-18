const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })


module.exports = (app, passport) => {


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
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  //登入
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)//用passport驗證
  app.get('/logout', userController.logout)

  //首頁導向restaurants
  app.get('/', authenticated, (req, res) => {
    res.redirect('/restaurants')
  })
  //列出所有restaurants的頁面
  app.get('/restaurants', authenticated, restController.getRestaurants)

  //feeds
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)

  //detail
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  //detail dashboard
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)


  //comment
  //新增
  app.post('/comments', authenticated, commentController.postComment)

  //profile
  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

  //admin首頁導向restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/restaurants')
  })
  //列出所有restaurants的頁面
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

  //admin的CRUD路由
  //Create
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  //Read
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  //Upgrade
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  //Delete
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  //edit user's admin
  app.get('/admin/users', authenticatedAdmin, adminController.editUser)
  app.put("/admin//users/:id", authenticatedAdmin, adminController.putUser)

  //category
  //瀏覽所有categories
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  //新增
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)

  //edit
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)  //修改頁面

  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)

  //delete
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  //favorite 
  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)










}