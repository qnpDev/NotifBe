const multer = require('multer')
const cloudinary = require('./Cloudinary')

let storage
if(process.env.SERVER_IMAGE_SAVE === 'cloudinary'){
    storage = cloudinary
}else{
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/')
        },
        filename: (req, file, cb) => {
            const filename = file.originalname.toLowerCase().split(' ').join('-')
            cb(null, Date.now() + '-' + filename)
        }
    })
}

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
module.exports = upload