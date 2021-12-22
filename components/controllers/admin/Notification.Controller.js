const Department = require('../../models/Department.Model')
const Notification = require('../../models/Notification.Model')
const User = require('../../models/User.Model')
const mongoose = require('mongoose')
require('dotenv').config()
const fs = require('fs');

class NotificationController{
    async index(req, res){
        const { id } = req.decoded
        let ownDepartment
        let listDepartment
        await User.findById(id).then(response => ownDepartment = response.per.department)
        await Department.find({_id: { $in: ownDepartment}}).then(response => listDepartment = response)
        await Notification.find({author: id, department: { $in: ownDepartment}}).sort({createdAt: -1}).then(response => {
            return res.json({success: true, data: response, department: listDepartment})
        })
    }
    async admin(req, res){
        let listDepartment
        await Department.find().then(response => listDepartment = response)
        await Notification.find()
            .populate('author', 'name avatar')
            .sort({createdAt: -1})
            .then(response => {
            return res.json({success: true, data: response, department: listDepartment})
        })
    }
    async add(req, res){
        const { id } = req.decoded
        const { name, content, important, department } = req.body

        if(Array.isArray(department))
            department.map(async v => {
                if(!mongoose.Types.ObjectId.isValid(v))
                    return res.json({success: false, msg: 'Not found ID Department!'})
                else
                    await Department.countDocuments({_id: v}).then(response => {
                        if(response === 0)
                            return res.json({success: false, msg: 'Not found ID Department!'})
                    })
            })
        else if(!mongoose.Types.ObjectId.isValid(department))
            return res.json({success: false, msg: 'Not found ID Department!'})
        else
            await Department.countDocuments({_id: department}).then(async response => {
                if(response === 0)
                    return res.json({success: false, msg: 'Not found ID Department!'})
                else{
                    const reqFiles = []
                    const url = req.protocol + '://' + req.get('host')

                    req.files.map(value  => {
                        reqFiles.push(url + '/public/files/' + value.filename)
                    })
                    const save = await new Notification({
                        name,
                        author: id,
                        content,
                        important,
                        department,
                        file: reqFiles,
                    }).save()
                    if(save){
                        await Notification.findById(save._id).populate('department', 'name sign').then(response => {
                            req.app.get('io').sockets.emit('notifNew', response)
                        })
                        
                        return res.json({success: true, data: save})
                    }else
                        return res.json({success: false, msg: 'Add false!'})
                }
            })
        
    }
    async edit(req, res){
        const { id, per } = req.decoded
        const { notifId, name, content, important, department, fileDel, fileOld } = req.body
        if(!department)
            return res.json({success: false, msg: 'Choose a department at least!'})
        let notif
        await Notification.findById(notifId).then(response => notif = response)
        if(!notif)
            return res.json({success: false, msg: 'Not Found!'})
        if (per < 2 && notif.author.toString() !== id)
            return res.json({success: false, msg: 'Not Permission!'})

        if(fileDel){
            if(typeof fileDel === 'string' || fileDel instanceof String){
                if (notif.file && notif.file.length > 0){
                    const linkImg = fileDel.split('/')
                    const path = './public/files/' + linkImg[linkImg.length - 1]
                    if (fs.existsSync(path)) {
                        fs.unlink(path, err => {
                        })
                    }
                }
            }else if(Array.isArray(fileDel) && fileDel.length > 0){
                fileDel.map(value => {
                    const linkImg = value.split('/')
                    const path = './public/files/' + linkImg[linkImg.length - 1]
                    if (fs.existsSync(path)) {
                        fs.unlink(path, err => {
                        })
                    }
                })
            }
        }

        const reqFiles = []
        const url = req.protocol + '://' + req.get('host')
    
        req.files.map(value  => {
            reqFiles.push(url + '/public/files/' + value.filename)
        })

        let fileSave = []
        if(fileOld){
            if(typeof fileOld === 'string' || fileOld instanceof String){
                fileSave = [fileOld, ...reqFiles]
            }else if(Array.isArray(fileOld) && fileOld.length > 0){
                fileSave = [...fileOld, ...reqFiles]
            }else{
                fileSave = reqFiles
            }
        }else{
            fileSave = reqFiles
        }

        await Notification.findByIdAndUpdate(notifId, {
            name,
            content,
            important,
            department,
            file: fileSave,
            updatedAt: Date.now(),
        })
        const data = await Notification.findById(notifId)
        return res.json({success: true, data: data})
    }
    async delete(req, res){
        const { id, per } = req.decoded
        const { notifId } = req.body
        let notif
        await Notification.findById(notifId).then(response => notif = response)
        if(!notif)
            return res.json({success: false, msg: 'Not Found!'})
        if (per < 2 && notif.author.toString() !== id)
            return res.json({success: false, msg: 'Not Permission!'})
        if (notif.file && notif.file.length > 0){
            notif.file.map(value => {
                const linkImg = value.split('/')
                const path = './public/files/' + linkImg[linkImg.length - 1]
                if (fs.existsSync(path)) {
                    fs.unlink(path, err => {
                    })
                }
            })
        }
        await Notification.findByIdAndDelete(notifId, (err, docs) => {
            if (err)
                return res.json({success: false, msg: 'Delete False!'})
            else
                return res.json({success: true, msg: 'Delete Successful!'})
        }).clone()
    }
    
    async department(req, res){
        const { id } = req.decoded
        const { idDepartment } = req.query
        if(!mongoose.Types.ObjectId.isValid(idDepartment))
            return res.json({success: false, msg: 'Not found ID Department!'})
        const checkD = await Department.countDocuments({_id: idDepartment})
        if(checkD === 0)
            return res.json({success: false, msg: 'Not found ID Department!'})
        let ownDepartment
        let listDepartment
        await User.findById(id).then(response => ownDepartment = response.per.department)
        await Department.find({_id: { $in: ownDepartment}}).then(response => listDepartment = response)
        await Notification.find({
            author: id,
            department: idDepartment,
        }).sort({createdAt: -1}).then(response => {
            return res.json({success: true, data: response, department: listDepartment})
        })
    }
    async departmentAdmin(req, res){
        const { idDepartment } = req.query
        if(!mongoose.Types.ObjectId.isValid(idDepartment))
            return res.json({success: false, msg: 'Not found ID Department!'})
        const checkD = await Department.countDocuments({_id: idDepartment})
        if(checkD === 0)
            return res.json({success: false, msg: 'Not found ID Department!'})
        let listDepartment
        await Department.find().then(response => listDepartment = response)
        await Notification.find({
            department: idDepartment,
        }).sort({createdAt: -1}).populate('author', 'name avatar').then(response => {
            return res.json({success: true, data: response, department: listDepartment})
        })
    }

}

module.exports = new NotificationController