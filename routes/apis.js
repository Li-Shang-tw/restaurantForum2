const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)
////////後台瀏覽個別餐廳
router.get('/admin/restaurants/:id ', adminController.getRestaurant)
////後台瀏覽種類
router.get('/admin/categories ', categoryController.getCategories)

module.exports = router