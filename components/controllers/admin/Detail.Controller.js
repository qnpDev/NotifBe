const Department = require('../../models/Department.Model')
const Notification = require('../../models/Notification.Model')
const Post = require('../../models/Post.Model')
const User = require('../../models/User.Model')
require('dotenv').config()

class DetailController{
    async index(req, res){
        let countUser = await User.countDocuments()
        let countPost = await Post.countDocuments()
        let countNotification = await Notification.countDocuments()
        let countDepartment = await Department.countDocuments()

        return res.json({success: true, countUser, countPost, countNotification, countDepartment})  
    }
}

module.exports = new DetailController