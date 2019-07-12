const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, cb) => {
    return Category.findAll().then(categories => {
      //edit的途徑
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => {
            cb({ categories: categories, category: category })
          })
      } else {
        //瀏覽所有
        cb({ categories: categories })
      }
    })
  }
}

module.exports = categoryService


