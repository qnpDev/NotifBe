const route = require('express').Router()
const Notification = require('../controllers/Notification.Controller')

route.get('/detail', Notification.detail)
route.get('/new', Notification.new)
route.get('/', Notification.index)

module.exports = route