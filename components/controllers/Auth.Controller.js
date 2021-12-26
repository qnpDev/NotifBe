const User = require('../models/User.Model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
require('dotenv').config()

class Auth{
    async login(req, res) {
        const { username, password } = req.body
        
        const find = await User.findOne({
            'per.username' : username,
            // 'per.isAdmin' : true,
        })

        if (find === null)
            res.json({success: false})
        else{
            bcrypt.compare(password, find.per.password, async (err, success) => {
                if (success){
                    const user = {
                        username,
                        per: find.per.permission,
                        id: find._id
                    }
                    const token = jwt.sign(user, process.env.TOKEN_SECRET, {
                        expiresIn: 60 * 5
                    })
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: 60 * 60 * 24 * 30
                    })
                    await User.findOneAndUpdate({
                        'per.username' : username,
                        'per.isAdmin' : true,
                        }, {
                            $push: {
                                refreshToken: refreshToken,
                            }
                    })
                    res.json({success: true, token: token, refreshToken: refreshToken})
                }else 
                    res.json({success: false})
            })
        }
    }

    async google(req, res) {
        const { tokenId, profileObj } = req.body

        if (!profileObj || !tokenId) {
            return res.json({success: false, msg: 'Have some error!'})
        }
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        if(!ticket){
            return res.json({success: false, msg: 'Auth false!!'})
        }

        const email = profileObj.email.split('@')

        if (email[1] === 'student.tdtu.edu.vn' || email[1] === 'tdtu.edu.vn'){
            await User.findOne({ 'per.googleId': profileObj.googleId }).then(async exists => {
                let token
                let refreshToken
                if (!exists){
                    const newUser = await new User({
                        per: {
                            email: profileObj.email,
                            googleId: profileObj.googleId,
                            studentId: email[0],
                        },
                        name: profileObj.name,
                        avatar: profileObj.imageUrl,
                        createdAt: Date.now(),
                    }).save()
                    const user = {
                        per: 0,
                        id: newUser._id
                    }
                    token = jwt.sign(user, process.env.TOKEN_SECRET, {
                        expiresIn: 60 * 5
                    })
                    refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: 60 * 60 * 24 * 30
                    })
                }else{
                    const user = {
                        per: 0,
                        id: exists._id
                    }
                    token = jwt.sign(user, process.env.TOKEN_SECRET, {
                        expiresIn: 60 * 5
                    })
                    refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: 60 * 60 * 24 * 30
                    })
                }
                await User.findOneAndUpdate({
                    'per.googleId': profileObj.googleId
                    }, {
                        // name: profileObj.name,
                        // avatar: profileObj.imageUrl,
                        $push: {
                            refreshToken: refreshToken,
                        }
                    })
                return res.json({success: true, token, refreshToken})
            })
        }else{
            return res.json({success: false, msg: 'Only available for @student.tdtu.edu.vn or @tdtu.edu.vn!'})
        }
    }

    async token(req, res) {
        const { refreshToken } = req.body
        if (refreshToken === null || !refreshToken)
            return res.json({success: false, msg: 'Not found'})
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err)
                return res.json({success: false, msg: 'RefreshToken die'})
            const user = await User.findById(decoded.id)
            if(!user){
                return res.json({success: false, msg: 'User not found'})
            }
            if (user.refreshToken.includes(refreshToken)){
                const userToken = {
                    username: decoded.username,
                    per: decoded.per,
                    id: decoded.id
                }
                const token = jwt.sign(userToken, process.env.TOKEN_SECRET, {
                    expiresIn: 60 * 5
                })
                return res.json({
                    success: true,
                    accessToken: token
                })
            }else{
                return res.json({success: false, msg: 'RefreshToken not found'})
            }
        })
    }

    async logout(req, res) {
        const { refreshToken } = req.body
        if (!refreshToken)
            return res.json({success: false})
        await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            await User.findOneAndUpdate({
                _id: decoded.id
            },{
                $pull: {
                    refreshToken: refreshToken
                }
            })
            return res.json({success: true})
        })
        // return res.json({success: false})
    }

}
module.exports = new Auth