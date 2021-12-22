require('./config')
require('dotenv').config()
const bcrypt = require('bcryptjs')

//User
const User = require('./User.Model')
const createUser = async () => {
    if((await User.countDocuments()) == 0)
        new User({
            per: {
                permission: 2,
                username: process.env.ADMIN_USERNAME,
                password: await bcrypt.hash(process.env.ADMIN_PASSWORD, await bcrypt.genSalt(12)),
                department: null,
            },
            name: 'Nguyễn Phú Quí',
        }).save()
}
createUser()

//Department
const Department = require('./Department.Model')
const createDepartment = async () => {
    if((await Department.countDocuments()) == 0){
        new Department({
            name: 'Khoa Công Nghệ Thông Tin',
            sign: 'CNTT',
        }).save()
        new Department({
            name: 'Khoa KHXH & NV',
            sign: 'KHXHNV',
        }).save()
    }
}
createDepartment()

