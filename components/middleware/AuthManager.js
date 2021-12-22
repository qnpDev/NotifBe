module.exports = (req, res, next) => {
    if (req.decoded.per < 1)
        return res.json({success: false, msg: 'Not permission!'})
    else
        next()
}