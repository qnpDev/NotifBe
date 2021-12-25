const Department = require('../../models/Department.Model')
require('dotenv').config()
const fs = require('fs');

class DeparmentController{
    async index(req, res){
        await Department.find().sort({createdAt: -1}).then(response => {
            return res.json(response)
        })
    }
    async add(req, res){
        if (req.error)
            return res.json({success: false, msg: req.error})
        const { name, sign } = req.body
        const count = await Department.countDocuments({ $or: [ {name}, {sign} ]})
        if (count > 0)
            return res.json({success: false, msg: 'Name or Sign already exists!'})
        else{
            if(req.file){
                let avatar
                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                    avatar = req.file.path
                }else{
                    avatar = req.protocol + '://' + req.get('host') + '/public/images/' + req.file.filename
                }
                const newDepartment = await new Department({
                    name,
                    sign,
                    avatar,
                }).save()
                if (newDepartment)
                    return res.json({success: true, data: newDepartment})
                else
                    return res.json({success: false, msg: 'Somethings wrong!'})
            }else{
                const newDepartment = await new Department({
                    name,
                    sign,
                }).save()
                if (newDepartment)
                    return res.json({success: true, data: newDepartment})
                else
                    return res.json({success: false, msg: 'Somethings wrong!'})
            }
            
        }
    }
    async delete(req, res){
        const { id } = req.body
        await Department.findByIdAndDelete(id).then(response=>{
            if (!response)
                return res.json({success: false, msg: 'Delete false!'})
            else{
                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){

                }else{
                    const linkImg = docs.avatar.split('/')
                    const path = './public/images/' + linkImg[linkImg.length - 1]
                    if (fs.existsSync(path)) {
                        fs.unlink(path, err => {
                        })
                    }
                }

                return res.json({success: true, msg: 'Delete successfully!'})
            }
                
        })
    }
    async edit(req, res){
        if (req.error)
            return res.json({success: false, msg: req.error})
        const { id, name, sign } = req.body
        await Department.findById(id).then(async response => {
            if (response === null)
                return res.json({success: false, msg: 'Not found!'})
            else{
                if (req.file){
                    let avatar
                    if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                        avatar = req.file.path
                    }else{
                        avatar = req.protocol + '://' + req.get('host') + '/public/images/' + req.file.filename
                        const linkImg = response.avatar.split('/')
                        const path = './public/images/' + linkImg[linkImg.length - 1]
                        if (fs.existsSync(path)) {
                            fs.unlink(path, err => {
                                if (err)
                                    return res.json({success: false, msg: 'Update false!'})
                            })
                        }
                    }

                    await Department.findByIdAndUpdate(id, {
                        name,
                        sign,
                        avatar,
                        updatedAt: Date.now(),
                    }).then(response2 => {
                        if (response2 === null)
                            return res.json({success: false, msg: 'Somethings wrong!'})
                        else
                            return res.json({success: true, data: response2})
                    })
                }else{
                    await Department.findByIdAndUpdate(id, {
                        name,
                        sign,
                        updatedAt: Date.now(),
                    }).then(response2 => {
                        if (response2 === null)
                            return res.json({success: false, msg: 'Somethings wrong!'})
                        else
                            return res.json({success: true, data: response2})
                    })
                }
            }
        })
    }
}

module.exports = new DeparmentController