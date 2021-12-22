const route = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
require('dotenv').config()
let user

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    user = profile
    console.log(user)
    return done(null, user)
}))

route.use(passport.initialize())

route.get('/callback', passport.authenticate('google', 
    {   session: false,
    }),
    (req, res) => {
        res.status(200).json(user)
    }
)

route.get('/result', (req, res)=>{
    if (user)
        return res.json({success: true, user})
    else
        return res.json({success: false})
})

route.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}))


module.exports = route