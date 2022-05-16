const express=require("express")
const bodyParser=require("body-parser")
const https=require("https")
const mongoose=require("mongoose")
const User=require("./models/User")
const validator=require("validator")
const bcrypt=require("bcrypt")
const fs=require("fs")
multer = require("multer")
require('dotenv').config();
const saltRounds=10
const controller=require("./serverController")
const Msg=require("./models/Msg")
const mqtt = require('mqtt')


//app
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
//connect mongoDB:mongodb+srv://RedBack:<password>@cluster-redback.pa0yu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const URI = process.env.DB_PROTOCOL + "://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + process.env.DB_CONNECTIONOPTIONS;
mongoose.connect(URI, {useNewUrlParser: true})

//send user value to MongoDB
app.post('/signup',(req,res)=>{
    controller.PostNewUser(req, res)
})

//find all user
app.get('/user',(req, res)=>{
    controller.FindAllUser(req, res)
})

//find a user with username: return password
app.get('/login/:username',(req, res)=>{
    controller.FindUsername(req, res)
})

//find specific user with user ID or username
app.get('/user/:id', (req, res) => {
    controller.FindUser(req, res)
})

//delete with user ID or username
app.delete('/user/:id',  (req, res) => {
    controller.DeleteUserID(req, res)
})

//change with user id or username
app.patch('/user/:id',(req, res)=>{
    controller.UpdateUser(req, res)
})

// Set storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage })

//Upload picture for certain user
app.patch("/user/:id/uploadphoto",upload.single('myImage'),(req,res)=>{
    controller.UploadUserPicture(req, res)
})

// Get profile picture
app.get('/user/:id/picture', (req,res,next)=> {
    controller.GetUserPicture(req, res)
});

const host = '34.129.191.60'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})

const topic = '/nodejs/mqtt'
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
  client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
})
client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
  const msg=new Msg({message:payload.toString().trim()})
  msg.save();
  console.error(`消息:"${payload.toString()}",已入库！`)
})

app.get('/mqtt',(req, res)=>{
  Msg.find((err, list)=>{
    if (err) {res.send(err)}
    else {res.send(list)}
})})
//listen to 8080 port
app.listen(process.env.SERVER_PORT,function(req,res){
    console.log("Web server is running in " + process.env.SERVER_PORT + "...");
})