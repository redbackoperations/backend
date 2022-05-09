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

//listen to 8080 port
app.listen(process.env.SERVER_PORT,function(req,res){
    console.log("Web server is running in " + process.env.SERVER_PORT + "...");
})