const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController.js')

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






}