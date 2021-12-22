const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err)
                return res.status(401).json({success: false, msg: 'unAuthorized access!'})
            req.decoded = decoded
            next()
        })
    }else{
        return res.status(403).json({success: false, msg: 'No token!'})
    }
}