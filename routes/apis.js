const express = require('express')
const router = express.Router()
// 引入 multer 並設定上傳資料夾 
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)
////////後台瀏覽個別餐廳
router.get('/admin/restaurants/:id ', adminController.getRestaurant)
////後台瀏覽種類
router.get('/admin/categories ', categoryController.getCategories)
//刪除餐廳
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
//post 上傳圖片
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
//put 
router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)
//post category
router.post('/admin/categories', categoryController.postCategory)

module.exports = router