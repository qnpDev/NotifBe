module.exports = (req, res, next) => {
    if (req.decoded.per !== 2)
        return res.json({success: false, msg: 'Not permission!'})
    else
        next()
}