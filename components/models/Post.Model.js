const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    img: [String],
    video: String,
    fell: String,
    like: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    comment: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        text: {type: String, default: null},
        img: [String],
        like: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        ],
        createdAt: {type: Date, default: Date.now()},
        updatedAt: {type: Date, default: null},
    }],
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: null},
})
const Post = mongoose.model('Post', postSchema)
module.exports = Post