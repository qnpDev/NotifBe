const route = require('express').Router()
const Users = require('../controllers/admin/User.Controller')
const Department = require('../controllers/admin/Department.Controller')
const Detail = require('../controllers/admin/Detail.Controller')
const upload = require('../controllers/upload/Image')
// User
route.get('/users', Users.getUsers)
route.post('/users/add', upload.single('image'), Users.add)
route.post('/users/delete', Users.delete)
route.post('/users/edit', upload.single('image'), Users.edit)
route.post('/users/editStudent', Users.editStudent)

//Department
route.get('/department', Department.index)
route.post('/department/add', upload.single('image'), Department.add)
route.post('/department/delete', Department.delete)
route.post('/department/edit', upload.single('image'), Department.edit)

//Detail
route.get('/', Detail.index)

module.exports = route