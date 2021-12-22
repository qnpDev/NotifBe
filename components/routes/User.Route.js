const route = require('express').Router()
const User = require('../controllers/User.Controller')

route.get('/post', User.post)
route.get('/id', User.getID)
route.post('/editDes', User.editDes)
route.post('/editWallpaper', User.editWallpaper)
route.post('/editAvatar', User.editAvatar)
route.post('/password', User.changePass)
route.get('/', User.index)

module.exports = route
