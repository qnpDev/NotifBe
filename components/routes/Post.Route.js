const route = require('express').Router()
const Post = require('../controllers/Post.Controller')
const upload = require('../controllers/upload/Image')

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
