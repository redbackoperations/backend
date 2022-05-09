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

//app
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
//connect mongoDB:mongodb+srv://RedBack:<password>@cluster-redback.pa0yu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const URI = process.env.DB_PROTOCOL + "://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + process.env.DB_CONNECTIONOPTIONS;
mongoose.connect(URI, {useNewUrlParser: true})

//send value to MongoDB

app.post('/signup',(req,res)=>{
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const user=new User({
        username:req.body.username,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email: req.body.email,
        password:hash,
        redbackCoins:req.body.redbackCoins,
        telephone:req.body.telephone,
        userLevel:req.body.userLevel,
    });
    var followers = {
        username: req.body.followUser,
    };
    user.followers.push(followers);
    var following = {
        username: req.body.following,
    };
    user.following.push(following);
    user.save().catch((err) => res.send(err));

if (res.statusCode === 200)
        {
            res.send("Success send!");
        }
        else 
        {
            res.send("Something wrong?");
        }

})

//find all user
app.get( '/user',(req, res)=>{
    User.find((err, list)=>{
            if (err) {res.send(err)}
            else {res.send(list)}
        })
    })

//find a user with username
app.get( '/login/:username',(req, res)=>{
    User.findOne({username: req.params.username},['password'], (err, list)=>{
        if (list) (res.send(list.password))
        else res.send("Cannot find username")
    })
    })


//find specific user with user ID or username
app.get('/user/:id', (req, res) => {
    User.findOne({_id: req.params.id}, (err, list)=>{
        if (list) (res.send(list))
        else {
            User.findOne({username:req.params.id},(err,list)=>{
                if(list){
                    res.send(list)
                }
                else res.send("Cannot find a user with given id or username")
            })
        }
    })
})

//delet with user ID or username
app.delete('/user/:id',  (req, res) => {
    User.deleteOne({_id: req.params.id}, function(err, list) {
        if (err) {
            User.deleteOne({username:req.params.id},function(err,list){
                if(err){
                    res.send("Cannot find user id or username");
                }
                else{
                    res.send(list);
                }
            })
          
        } else {
          res.send(list);
        }
      });
})

//change with user id or username
app.patch('/user/:id',(req, res)=>{
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);
    User.update(
        {_id: req.params.id},
        {$set:{username: req.body.username,
            password: hash,
            telephone : req.body.telephone,
            email: req.body.email,
            }},
        (err)=>{
            if (!err) {res.send('Successfully update a user with user id')}
            else {
                User.update({username:req.params.id},
                    { $set:{username:req.body.username,
                        password:hash,
                        telephone : req.body.telephone,
                        email: req.body.email,}},(err)=>{
                            if(!err){res.send('Successfully update a user with username')}
                            else res.send(err);
                        }
                        )
            }
        }
    )
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
    var img = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);
    var encode_img = img.toString('base64');
    var final_img = {
        contentType:req.file.mimetype,
        data:new Buffer(encode_img,'base64')
    };
    console.log(final_img)
    User.update(
        {_id: req.params.id},
        {$set:{img:final_img
            }},
        (err)=>{
            if (!err) {
               res.send('Successfully upload a picture for a user')
            }
            else res.send(err)
        }
    )

})

// Get profile picture
app.get('/user/:id/picture', (req,res,next)=> {
    User.findById( req.params.id, (err,user)=> {
        if (err) return next(err);
        res.contentType(user.img.contentType);
        res.send(user.img.data);
    });
  });

//listen to 8080 port
app.listen(process.env.SERVER_PORT,function(req,res){
    console.log("Web server is running in " + process.env.SERVER_PORT + "...");
})