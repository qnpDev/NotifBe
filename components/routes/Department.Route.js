const route = require('express').Router()
const Department = require('../controllers/Department.Controller')

route.get('/listNotif', Department.listNotif)
route.get('/', Department.index)

module.exports = route