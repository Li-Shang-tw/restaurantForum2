const express = require('express')
const app = express()
const db = require('./models') // 引入資料庫
const port = process.env.PORT || 3000
const bodyparser = require('body-parser')
const passport = require('./config/passport')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {      // 如果不是 production 模式
  require('dotenv').config()                      // 使用 dotenv 讀取 .env 檔案
}

const flash = require('connect-flash')
const session = require('express-session')

app.use(bodyparser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use('/upload', express.static(__dirname + '/upload'))

const handlebars = require('express-handlebars')
//使用handlebars template
app.engine('handlebars', handlebars({ defaultLayout: "main", helpers: require('./config/handlebars-helpers') }))
app.set('view engine', 'handlebars')

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

//setup passport
app.use(passport.initialize())
app.use(passport.session())
// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user // 加這行
  next()
})


app.listen(port, () => {
  db.sequelize.sync() // 跟資料庫同步
  console.log('express is running')
})

require('./routes')(app)