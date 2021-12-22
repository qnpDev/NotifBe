const Auth = require('./Auth.Route')
const checkAuth = require('../middleware/AuthToken')
const checkAuthAdmin = require('../middleware/AuthAdmin')
const checkAuthManager = require('../middleware/AuthManager')
const User = require('./User.Route')
const Post = require('./Post.Route')
const Admin = require('./Admin.Route')
const Department = require('./Department.Route')
const Manager = require('./Manager.Route')
const Notification = require('./Notification.Route')

const route = app => {

    app.use('/auth', Auth)
    app.use('/user', checkAuth, User)
    app.use('/post', checkAuth, Post)
    app.use('/department', checkAuth, Department)
    app.use('/notification', checkAuth, Notification)
    app.use('/admin', checkAuth, checkAuthAdmin, Admin)
    app.use('/manager', checkAuth, checkAuthManager, Manager)
    
}
module.exports = route