const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'qnp | MongoDB connection error'));
db.once('open', ()=> console.log('qnp | DB connected!')) 