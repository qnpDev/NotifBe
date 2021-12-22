const route = require('express').Router()
const Users = require('../controllers/admin/User.Controller')
const Department = require('../controllers/admin/Department.Controller')
const Detail = require('../controllers/admin/Detail.Controller')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/')
    },
    filename: (req, file, cb) => {
        const filename = file.originalname.toLowerCase().split(' ').join('-')
        cb(null, Date.now() + '-' + filename)
    }
})

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            req.error = 'Only .png, .jpg and .jpeg format allowed!';
        }
    }
})
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