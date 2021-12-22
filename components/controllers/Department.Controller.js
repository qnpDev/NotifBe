const Department = require('../models/Department.Model')
const Notification = require('../models/Notification.Model')
const mongoose = require('mongoose')

class DeparmentController{
    async index(req, res){
        await Department.find().then(response => {
            return res.json(response)
        })
    }
    async listNotif(req, res){
        const { idDepartment } = req.query
        if(!mongoose.Types.ObjectId.isValid(idDepartment))
            return res.json({success: false, msg: 'Not found ID!'})
        let departmentData
        await Department.findById(idDepartment).then(response => departmentData = response)
        if (departmentData)
            await Notification.find({department: idDepartment})
            .sort({createdAt: -1})
            .then(response=>{
                return res.json({success: true, data: response, department: departmentData})
            })
        else
            return res.json({success: false, msg: 'Not Found Department'})
    }
}

module.exports = new DeparmentController