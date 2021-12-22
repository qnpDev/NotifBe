const route = require('express').Router()
const Post = require('../controllers/Post.Controller')
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


route.post('/new', upload.array('imgCollection'), Post.newPost)
route.post('/like', Post.like)
route.post('/edit', upload.array('imgCollection'), Post.editPost)
route.post('/delete', Post.deletePost)
route.post('/newComment', Post.newComment)
route.post('/likeComment', Post.likeComment)
route.post('/deleteComment', Post.deleteComment)
route.post('/editComment', Post.editComment)
route.get('/', Post.index)

module.exports = route
