const Department = require('../models/Department.Model')
const Notification = require('../models/Notification.Model')
const mongoose = require('mongoose')

class NotificationController{
    async index(req, res){
        let listDepartment
        await Department.find().then(response => listDepartment = response)
        await Notification.find()
            .sort({createdAt: -1})
            .populate('department', 'name sign')
            .then(response => {
                return res.json({success: true, data: response, department: listDepartment})
        })
    }
    async new(req, res){
        await Notification.find()
            .limit(5)
            .sort({createdAt: -1})
            .populate('department', 'name sign')
            .then(response => {
                return res.json({success: true, data: response})
            })
    }
    async detail(req, res){
        const { idNotif } = req.query
        const { id } = req.decoded
        if(!mongoose.Types.ObjectId.isValid(idNotif))
            return res.json({success: false, msg: 'Not found ID!'})
        await Notification.findById(idNotif).populate('department', 'name sign').then(async response => {
            if(response === null)
                return res.json({success: false, msg: 'Somethings wrong!'})
            else{
                if(!response.read.includes(id)){
                    await Notification.findByIdAndUpdate(idNotif, {
                        $push: {
                            read: id
                        }
                    }, err => {
                        if (err)
                            return res.json({success: false, msg: 'Somethings wrong!'})
                    }).clone()
                }
                return res.json({success: true, data: response})
            }
        })
    }
}

module.exports = new NotificationController