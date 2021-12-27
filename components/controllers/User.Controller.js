const User = require('../models/User.Model')
const Post = require('../models/Post.Model')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs');

class UserController{
    async index(req, res){
        const { id } = req.query
        const userId = id || req.decoded.id

        if(!mongoose.Types.ObjectId.isValid(userId))
            return res.json({success: false, msg: 'Not found userID!'})
        else{
            await User.findById(userId, 'name description avatar wallpaper per.permission per.class per.faculty').then(async response=>{
                if (!response)
                    return res.json({success: false, msg: 'Not found userID!'})
                else{
                    return res.json({
                        success: true,
                        user: response,
                    })
                }
            })
        }
    }
    async post(req, res) {
        const { id, limit } = req.query
        const userId = id || req.decoded.id

        if(!mongoose.Types.ObjectId.isValid(userId))
            return res.json({success: false, msg: 'Not found userID!'})
        else{
            const post = await Post.find({author: userId})
            .sort({createdAt: -1, updatedAt: -1})
            .skip(10*limit)
            .limit(10)
            .populate('author', 'name avatar')
            .populate('comment.author', 'name avatar')
            .populate('like', 'name avatar')
            .exec()
            return res.json({
                success: true,
                post
            })
        }
    }
    async getID(req, res){
        const { id } = req.decoded
        if (id)
        await User.findById(id).then(response=>{
            if(!response)
                return res.json({success: false})
            else{
                return res.json({success: true, id, avatar: response.avatar, per: response.per.permission})
            }
        })
        else
            res.json({success: false})
    }
    async editDes(req, res){
        const { id, per } = req.decoded
        const { userId, description, name, lop, khoa } = req.body

        if(!name)
            return res.json({success: false, msg: 'Somethings wrong!'})
        if(name && name.trim() === '')
            return res.json({success: false, msg: 'Somethings wrong!'})

        if(per >= 2 || id === userId){
            await User.findByIdAndUpdate(userId, {
                description,
                name: name.trim(),
                'per.class': lop,
                'per.faculty': khoa,
            }).then(response => {
                if (response !== null)
                    return res.json({success: true, msg: 'Update Successful!'})
                else
                    return res.json({success: false, msg: 'Update False!'})
            })
        }else{
            return res.json({success: false, msg: 'Somethings wrong!'})
        }
        
    }
    async editWallpaper(req, res){
        const { id, per } = req.decoded
        const { wallpaper, userId } = req.body

        if(!wallpaper)
            return res.json({success: false, msg: 'Somethings wrong!'})
        if(wallpaper && wallpaper.trim() === '')
            return res.json({success: false, msg: 'Somethings wrong!'})

        if(per >= 2 || id === userId){
            await User.findByIdAndUpdate(userId, {
                wallpaper: wallpaper.trim(),
            }).then(response => {
                if (response !== null)
                    return res.json({success: true, msg: 'Update Successful!'})
                else
                    return res.json({success: false, msg: 'Update False!'})
            })
        }else{
            return res.json({success: false, msg: 'Somethings wrong!'})
        }
        
    }
    async editAvatar(req, res){
        const { id, per } = req.decoded
        const { avatar, userId } = req.body

        if(!avatar)
            return res.json({success: false, msg: 'Somethings wrong!'})
        if(avatar && avatar.trim() === '')
            return res.json({success: false, msg: 'Somethings wrong!'})

        if(per >= 2 || id === userId){
            if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){

            }else{
                await User.findById(userId).then(response=> {
                    if(response !== null){
                        const linkImg = response.avatar.split('/')
                        const path = './public/images/' + linkImg[linkImg.length - 1]
                        if (fs.existsSync(path)) {
                            fs.unlink(path, err => {
                            })
                        }
                    }else
                        return res.json({success: false, msg: 'Somethings wrong!'})
                })
            }

            await User.findByIdAndUpdate(userId, {
                avatar: avatar.trim(),
            }).then(response => {
                if (response !== null)
                    return res.json({success: true, msg: 'Update Successful!'})
                else
                    return res.json({success: false, msg: 'Update False!'})
            })
        }else{
            return res.json({success: false, msg: 'Somethings wrong!'})
        }
    }
    async changePass(req, res){
        const { id, per } = req.decoded
        const { oldPassword, newPassword } = req.body

        if(per < 1)
            return res.json({success: false, msg: 'Error permission!'})
        if(!oldPassword || oldPassword.length < 4)
            return res.json({success: false, msg: 'Error oldPassword!'})
        if(!newPassword || newPassword.length < 4)
            return res.json({success: false, msg: 'Error newPassword!'})
        let find = await User.findById(id)
        bcrypt.compare(oldPassword, find.per.password, async (err, success) => {
            if (success){
                await User.findByIdAndUpdate(id, {
                    'per.password': await bcrypt.hash(newPassword, await bcrypt.genSalt(12))
                }).then(response => {
                    if(response !== null)
                        return res.json({success: true, msg: 'Change Successful!'})
                    else
                        return res.json({success: false, msg: 'Change False!'})
                })
            }else 
                return res.json({success: false, msg: 'Old Password does not match!'})
        })
        
    }
}
module.exports = new UserController