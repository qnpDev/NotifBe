const mongoose = require('mongoose')
require('dotenv').config()

const userSchema = mongoose.Schema({
    per: {
        // isAdmin: {type: Boolean, default: false},
        permission: {type: Number, default: 0},
        username: String,
        password: String,
        department: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Department'}
        ],
        email: String,
        googleId: String,
        studentId: String,
        class: String,
        faculty: String,
    },
    name: String,
    avatar: {type: String, default: process.env.DEFAULT_AVATAR},
    wallpaper: {type: String, default: process.env.DEFAULT_WALLPAPER},
    description: {type: String, default: null},
    refreshToken: [String],
    updatedAt: {type: Date, default: null},
    createdAt: {type: Date, default: Date.now()}
})

const User = mongoose.model('User', userSchema)
module.exports = User