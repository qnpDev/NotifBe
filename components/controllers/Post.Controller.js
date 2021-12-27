const Post = require('../models/Post.Model')
const multiparty = require('multiparty')
const fs = require('fs');
const io = require('socket.io')

class PostController{
    async index(req, res){
        const { limit } = req.query
        const post = await Post.find()
            .sort({createdAt: -1, updatedAt: -1})
            .skip(10*limit)
            .limit(10)
            .populate('author', 'name avatar')
            .populate('comment.author', 'name avatar')
            .populate('like', 'name avatar')
            .exec()
        return res.json(post)
    }
    async newPost(req, res){
        const author = req.decoded.id
        const {text, video} = req.body

        if (req.error)
            return res.json({success: false, msg: req.error})

        const reqFiles = []
        
        if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
            req.files.map(value => {
                reqFiles.push(value.path)
            })
        }else{
            const url = req.protocol + '://' + req.get('host')

            req.files.map(value  => {
                reqFiles.push(url + '/public/images/' + value.filename)
            })
        }
        
        const save = await new Post({
            author,
            text,
            img: reqFiles,
            video,
            createdAt: Date.now(),
        }).save()

        const post = await Post.findById(save._id)
            .populate('author', 'name avatar')
            .exec()

        if(save){
            req.app.get('io').sockets.emit('postNew', post)
            return res.json({success: true, data: post})
        }else
            return res.json({success: false, msg: 'Add false!'})
    }
    async like(req, res){
        const { postId } = req.body
        const idUser = req.decoded.id
        await Post.findById(postId).then(async response=>{
            if(response === null)
                return res.json({success: false, msg: 'Somethings wrong!'})
            else if(response.like.includes(idUser)){
                await Post.findOneAndUpdate({
                    _id: postId
                },{
                    $pull: {
                        like: idUser
                    }
                })
                let dataLike
                await Post.findById(postId)
                    .populate('like', 'name avatar')
                    .then(r => dataLike = r.like)

                req.app.get('io').sockets.emit('postLike' + postId, {
                    postId, 
                    idUser, 
                    like: false, 
                    // countLike: (response.like.length - 1), 
                    data: dataLike,
                })
                return res.json({success: true, msg: false})
            }else{
                await Post.findOneAndUpdate({
                    _id: postId
                },{
                    $push: {
                        like: idUser
                    }
                })

                let dataLike
                await Post.findById(postId)
                    .populate('like', 'name avatar')
                    .then(r => dataLike = r.like)

                req.app.get('io').sockets.emit('postLike' + postId, {
                    postId, 
                    idUser, 
                    like: true, 
                    // countLike: (response.like.length + 1),
                    data: dataLike,
                })
                return res.json({success:true, msg: true})
            }
                
        })
    }
    async editPost(req, res){
        const author = req.decoded.id
        const { per } =req.decoded
        const { id, text, video, imgDel, imgOld } = req.body

        if (req.error)
            return res.json({success: false, msg: req.error})
        await Post.findById(id).then(async response=>{
            if(response !== null){
                if(per >= 2 || response.author.toString() === author){
                    if(imgDel){
                        if(typeof imgDel === 'string' || imgDel instanceof String){
                            if (response.img && response.img.length > 0){
                                if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                                
                                }else{
                                    const linkImg = imgDel.split('/')
                                    const path = './public/images/' + linkImg[linkImg.length - 1]
                                    if (fs.existsSync(path)) {
                                        fs.unlink(path, err => {
                                        })
                                    }
                                }
                                
                            }
                        }else if(Array.isArray(imgDel) && imgDel.length > 0){
                            if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){

                            }else{
                                imgDel.map(value => {
                                    const linkImg = value.split('/')
                                    const path = './public/images/' + linkImg[linkImg.length - 1]
                                    if (fs.existsSync(path)) {
                                        fs.unlink(path, err => {
                                        })
                                    }
                                })
                            }
                            
                        }
                    }

                    const reqFiles = [];

                    if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                        req.files.map(value => {
                            reqFiles.push(value.path)
                        })
                    }else{
                        const url = req.protocol + '://' + req.get('host')
            
                        req.files.map(value  => {
                            reqFiles.push(url + '/public/images/' + value.filename)
                        })
                    }

                    let imgSave = []
                    if(imgOld){
                        if(typeof imgOld === 'string' || imgOld instanceof String){
                            imgSave = [imgOld, ...reqFiles]
                        }else if(Array.isArray(imgOld) && imgOld.length > 0){
                            imgSave = [...imgOld, ...reqFiles]
                        }else{
                            imgSave = reqFiles
                        }
                    }else{
                        imgSave = reqFiles
                    }

                    await Post.findByIdAndUpdate(id,{
                        img: imgSave,
                        text,
                        video,
                        updatedAt: Date.now(),
                    }).then(async response2 => {
                        if (response2 !== null){
                            await Post.findById(id).then(response3 => 
                                req.app.get('io').sockets.emit('postEdit' + id, response3)
                            )
                            
                            return res.json({success: true, msg: 'Edit Successful!'})
                        }else
                            return res.json({success: false, msg: 'Edit false!'})
                    })
                }else{
                    return res.json({success: false, msg: 'Not the owner!'})
                }
            }else{
                return res.json({success: false, msg: 'Not found!'})
            }
            
        })
    }
    async deletePost(req, res){
        const author = req.decoded.id
        const { per } = req.decoded
        const { id } = req.body
        if (req.error)
            return res.json({success: false, msg: req.error})
        await Post.findById(id).then(response=>{
            if(response !== null){
                if(per >= 2 || response.author.toString() === author){
                    if (response.img && response.img.length > 0){
                        if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
                            
                        }else{
                            response.img.map(value => {
                                const linkImg = value.split('/')
                                const path = './public/images/' + linkImg[linkImg.length - 1]
                                if (fs.existsSync(path)) {
                                    fs.unlink(path, err => {
                                    })
                                }
                            })
                        }
                        
                        
                    }
                    Post.findByIdAndDelete(id, (err, docs)=>{
                        if (err)
                            return res.json({success: false, msg: 'Delete false!'})
                        else{
                            req.app.get('io').sockets.emit('postDelete' + id, id)
                            return res.json({success: true, msg: 'Delete successfully!'})
                        }
                            
                    })
                }else{
                    return res.json({success: false, msg: 'Not the owner!'})
                }
            }else{
                return res.json({success: false, msg: 'Not Found!'})
            }

        })
    }
    async newComment(req, res){
        const { postId, text } = req.body
        const userId = req.decoded.id
        await Post.findById(postId).then(async response=>{
            if(response === null){
                return res.json({success: false, msg: "Can not find post!"})
            }else{
                await Post.findOneAndUpdate({_id: postId}, {
                    $push: {
                        comment : {
                            author: userId,
                            text,
                            createdAt: Date.now(),
                        }
                    }
                }).then(async response2=> {
                    if(response2){
                        const comment = await Post.findById(response2._id)
                            .populate('comment.author', 'name avatar')
                            .exec()
                        req.app.get('io').sockets.emit('postCommentNew' + postId, comment)
                        return res.json({success: true, data: comment.comment})
                }else
                        return res.json({success: false, msg: 'Add comment error!'})
                })
            }
        })
    }
    async likeComment(req, res){
        const author = req.decoded.id
        const { postId, commentId } = req.body
        if (req.error)
            return res.json({success: false, msg: req.error})
        await Post.findOne({
            _id: postId,
            'comment._id': commentId
        }).then(async response=>{
            if (response === null){
                return res.json({success: false, msg: 'Something wrong!'})
            }else{
                let newData = response.comment
                let flag = false

                newData.map((value, index) => {
                    (value._id.toString() === commentId && value.like.includes(author))
                        ? flag = true
                        : null
                })

                if (flag){
                    newData.map((value, index)=>
                        value._id.toString() === commentId 
                            ? newData[index].like = newData[index].like.filter(v => v._id.toString() !== author)
                            : null
                    )
                }else{
                    newData.map((value, index)=>
                        value._id.toString() === commentId 
                            ? newData[index].like.push(author)
                            : null
                    )
                }

                await Post.findOneAndUpdate({_id: postId},{
                    comment: newData
                })

                if(flag)
                    req.app.get('io').sockets.emit('postCommentLike' + commentId, {like: false, idUser: author})
                else
                    req.app.get('io').sockets.emit('postCommentLike' + commentId, {like: true, idUser: author})

                return res.json({success: true, msg: 'Like successfull!'})
            }
        })
    }
    async deleteComment(req, res){
        const author = req.decoded.id
        const { per } = req.decoded
        const { postId, commentId } = req.body

        if(per >= 2){
            await Post.findOneAndUpdate({
                _id: postId,
                'comment._id': commentId
            },{
                $pull: {
                    comment: {
                        _id: commentId
                    }
                }
            }).then(response=>{
                if (response === null)
                    return res.json({success: false, msg: 'Delete false!'})
                else{
                    req.app.get('io').sockets.emit('postCommentDelete' + postId, {postId, commentId})
                    return res.json({success: true, msg: 'Delete successfully!'})
                }
            })
        }else{
            await Post.findOneAndUpdate({
                _id: postId,
                'comment._id': commentId,
                'comment.author': author
            },{
                $pull: {
                    comment: {
                        _id: commentId
                    }
                }
            }).then(response=>{
                if (response === null)
                    return res.json({success: false, msg: 'Delete false!'})
                else{
                    req.app.get('io').sockets.emit('postCommentDelete' + postId, {postId, commentId})
                    return res.json({success: true, msg: 'Delete successfully!'})
                }
            })
        }

        
    }
    async editComment(req, res){
        const author = req.decoded.id
        const { per } = req.decoded
        const { postId, commentId, text } = req.body
        if(per >= 2){
            await Post.findOne({
                _id: postId,
                'comment._id': commentId
            }).then(async response=>{
                if (response === null){
                    return res.json({success: false, msg: 'Something wrong!'})
                }else{
                    let newData = response.comment
    
                    newData.map((value, index) => {
                        if (value._id.toString() === commentId){
                            newData[index].text = text
                            newData[index].updatedAt = Date.now()
                            
                        }
                        return
                    })
    
                    await Post.findOneAndUpdate({_id: postId},{
                        comment: newData
                    })
                    // req.app.get('io').sockets.emit('postCommentEdit' + postId, {postId, commentId, text})
                    req.app.get('io').sockets.emit('postCommentEdit' + commentId, {postId, commentId, text})
                    return res.json({success: true, msg: 'Edit successfull!'})
                }
            })
        }else{
            await Post.findOne({
                _id: postId,
                'comment._id': commentId,
                'comment.author': author
            }).then(async response=>{
                if (response === null){
                    return res.json({success: false, msg: 'Something wrong!'})
                }else{
                    let newData = response.comment

                    newData.map((value, index) => {
                        if (value._id.toString() === commentId){
                            newData[index].text = text
                            newData[index].updatedAt = Date.now()
                            
                        }
                        return
                    })

                    await Post.findOneAndUpdate({_id: postId},{
                        comment: newData
                    })
                    req.app.get('io').sockets.emit('postCommentEdit'  + postId, {postId, commentId, text})
                    return res.json({success: true, msg: 'Edit successfull!'})
                }
            })
        }
        
    }
}
module.exports = new PostController