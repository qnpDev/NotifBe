const route = require('express').Router()
const Auth = require('../controllers/Auth.Controller')

route.post('/login', Auth.login)
route.post('/logout', Auth.logout)
route.post('/token', Auth.token)
route.post('/google', Auth.google)

module.exports = route
