const mongoose = require('mongoose')
require('dotenv').config()
const departmentSchema = mongoose.Schema({
    name: String,
    avatar: {type: String, default: process.env.DEFAULT_DEPARTMENT_AVATAR},
    sign: {type: String, default: null},
    updatedAt: {type: Date, default: null},
    createdAt: {type: Date, default: Date.now()},
})

const Department = mongoose.model('Department', departmentSchema)
module.exports = Department