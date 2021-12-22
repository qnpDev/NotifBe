const route = require('express').Router()
const Auth = require('../controllers/Auth.Controller')
// const AuthGoogle = require('./AuthGoogle.Route')

route.post('/login', Auth.login)
route.post('/logout', Auth.logout)
route.post('/token', Auth.token)
// route.use('/google', AuthGoogle)
route.post('/google', Auth.google)

module.exports = route
