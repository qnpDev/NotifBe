const express = require('express')
const app = express()
const route = require('./components/routes')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
require('./components/models')

app.use(express.static(__dirname + 'public'));
app.use(cors({
    origin: '*',
    methods: "GET, POST, PATCH, DELETE, PUT",
    credentials:true,
    optionSuccessStatus:200,
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/public/images', express.static(__dirname + '/public/images'))
app.use('/public/files', express.static(__dirname + '/public/files'))
app.use('/public', express.static(__dirname + '/public'))

const server = app.listen(process.env.PORT || 9000, () => {
    console.log('qnp | server started!')
})

// SocketIO
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
})
app.set('io', io)

// Route
route(app)

//Index page
const path = require('path');
app.get('/', (req, res) => res.sendFile(path.join(__dirname,'/components/views/index.html')))
// Err
app.get('*', (req, res) => res.status(404).sendFile(path.join(__dirname,'/components/views/index.html')))