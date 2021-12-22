const mongoose = require('mongoose')
const notificationSchema = mongoose.Schema({
    name: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
    ],
    content: {type: String, default: null},
    important: {type: Boolean, default: false},
    file: [{type: String, default: null}],
    read: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: null}
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification