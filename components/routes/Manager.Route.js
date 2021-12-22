const route = require('express').Router()
const Notification = require('../controllers/admin/Notification.Controller')
const multer = require('multer')
const checkAuthAdmin = require('../middleware/AuthAdmin')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/files/')
    },
    filename: (req, file, cb) => {
        const filename = file.originalname.toLowerCase().split(' ').join('-')
        cb(null, Date.now() + '-' + filename)
    }
})

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
})

route.get('/department', Notification.department)
route.get('/department/admin', checkAuthAdmin, Notification.departmentAdmin)

route.get('/admin', checkAuthAdmin, Notification.admin)
route.post('/add', upload.array('files'), Notification.add)
route.post('/edit', upload.array('files'), Notification.edit)
route.post('/delete', Notification.delete)
route.get('/', Notification.index)

module.exports = route