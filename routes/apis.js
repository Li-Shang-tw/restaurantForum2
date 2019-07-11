const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')

router.get('/admin/restaurants', adminController.getRestaurants)
////////後台瀏覽個別餐廳
router.get('/admin/restaurants/:id ', adminController.getRestaurant)


module.exports = router