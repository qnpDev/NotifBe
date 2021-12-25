const User = require('../../models/User.Model')
const Notification = require('../../models/Notification.Model')
const Post = require('../../models/Post.Model')
const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const fs = require('fs');

class UserController{
    async getUsers(req, res) {
            const users = await User.find()
                .select('-per.password')
                .sort({createdAt: -1})
                .exec()
            return res.json({success: true, users})
        
    }
    async add(req, res) {
        if (req.error)
            return res.json({success: false, msg: req.error})
        const { name, username, pass, department, per } = req.body

        if(!pass || pass.length < 4)
            return res.json({success: false, msg: 'Password at least 4 character!'})

        const count = await User.countDocuments({ 'per.username': username })
        if (count > 0)
            return res.json({success: false, msg: 'Username already exists!'})
        else{
            if (req.file){
                let avatar 
                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                    avatar = req.file.path
                }else{
                    avatar = req.protocol + '://' + req.get('host') + '/public/images/' + req.file.filename
                }
                const save = await new User({
                    name,
                    avatar,
                    per: {
                        permission: per,
                        username,
                        password: await bcrypt.hash(pass, await bcrypt.genSalt(12)),
                        department,
                    },
    
                }).save()
                return res.json({success: true, data: save})
            }else{
                const save = await new User({
                    name,
                    per: {
                        permission: per,
                        username,
                        password: await bcrypt.hash(pass, await bcrypt.genSalt(12)),
                        department,
                    },
    
                }).save()
                return res.json({success: true, data: save})
            }
        }
    }
    async delete(req, res){
        const { id } = req.body

        const remove = await User.findByIdAndDelete(id)

        if(remove){
            if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){

            }else if(remove.avatar && remove.avatar !== process.env.DEFAULT_AVATAR && remove.per.permission !== 0){
                const linkImg = docs.avatar.split('/')
                fs.unlink('./public/images/' + linkImg[linkImg.length - 1], err => {
                })
            }
            
            if (remove.per.permission > 0){
                await Notification.deleteMany({author: id})
            }
            await Post.deleteMany({author: id})

            return res.json({success: true, msg: 'Delete successfully!'})
        }else{
            return res.json({success: false, msg: 'Delete false!'})
        }
    }
    async edit(req, res){
        if (req.error)
            return res.json({success: false, msg: req.error})
        const { id, name, username, pass, department, permission, wallpaper } = req.body
        
        let dataUser
        await User.findById(id).then(response => {
            if (response !== null)
                dataUser = response
            else
                return res.json({success: false, msg: 'Cannot Found!'})
        })

        const count = await User.countDocuments({ 
            'per.username': username,
            _id: { $nin: [id] },
        })
        if (count > 0)
            return res.json({success: false, msg: 'Username already exists!'})

        if (pass && pass !== ''){
            if(pass.length < 4)
                return res.json({success: false, msg: 'Password at least 4 character!'})
            else if (req.file){
                let avatar 
                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                    avatar = req.file.path
                }else{
                    avatar = req.protocol + '://' + req.get('host') + '/public/images/' + req.file.filename
                    const linkImg = dataUser.avatar.split('/')
                    const path = './public/images/' + linkImg[linkImg.length - 1]
                    if (fs.existsSync(path)) {
                        fs.unlink(path, err => {
                        })
                    }
                }

                await User.findByIdAndUpdate(id, {
                    name,
                    avatar,
                    wallpaper,
                    updatedAt: Date.now(),
                    per: {
                        ...dataUser.per,
                        username,
                        password: await bcrypt.hash(pass, await bcrypt.genSalt(12)),
                        department,
                        permission,
                    },
                }, (err, docs) => {
                    if(err)
                        return res.json({success: false, msg: 'Update false!'})
                    else
                        return res.json({success: true, data: docs})
                }).clone()
                
            }else{
                await User.findByIdAndUpdate(id, {
                    name,
                    wallpaper,
                    updatedAt: Date.now(),
                    per: {
                        ...dataUser.per,
                        username,
                        password: await bcrypt.hash(pass, await bcrypt.genSalt(12)),
                        department,
                        permission,
                    },
                }, (err, docs) => {
                    if(err)
                        return res.json({success: false, msg: 'Update false!'})
                    else
                        return res.json({success: true, data: docs})
                }).clone()
            }
        }else{
            if (req.file){
                let avatar 
                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                    avatar = req.file.path
                }else{
                    avatar = req.protocol + '://' + req.get('host') + '/public/images/' + req.file.filename
                    const linkImg = dataUser.avatar.split('/')
                    const path = './public/images/' + linkImg[linkImg.length - 1]
                    if (fs.existsSync(path)) {
                        fs.unlink(path, err => {
                        })
                    }
                }
                await User.findByIdAndUpdate(id, {
                    name,
                    avatar,
                    wallpaper,
                    updatedAt: Date.now(),
                    per: {
                        ...dataUser.per,
                        username,
                        department,
                        permission,
                    },
                }, (err, docs) => {
                    if(err)
                        return res.json({success: false, msg: 'Update false!'})
                    else
                        return res.json({success: true, data: docs})
                }).clone()
                
            }else{
                await User.findByIdAndUpdate(id, {
                    name,
                    wallpaper,
                    updatedAt: Date.now(),
                    per: {
                        ...dataUser.per,
                        username,
                        department,
                        permission,
                    },
                }, (err, docs) => {
                    if(err)
                        return res.json({success: false, msg: 'Update false!'})
                    else
                        return res.json({success: true, data: docs})
                }).clone()
            }
        }
    }
    async editStudent(req, res){
        const { id, name, permission, wallpaper, avatar, lop, faculty } = req.body

        let dataUser
        await User.findById(id).then(response => {
            if (response !== null)
                dataUser = response
            else
                return res.json({success: false, msg: 'Cannot Found!'})
        })
        await User.findByIdAndUpdate(id, {
            name,
            avatar,
            wallpaper,
            per: {
                ...dataUser.per,
                permission,
                class: lop,
                faculty 
            }
        }, (err, docs) => {
            if(err)
                return res.json({success: false, msg: 'Update false!'})
            else
                return res.json({success: true, data: docs})
        }).clone()
    }
}
module.exports = new UserController