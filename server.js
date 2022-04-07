const express=require("express")
const bodyParser=require("body-parser")
const https=require("https")
const mongoose=require("mongoose")
const User=require("./models/User")
const validator=require("validator")
//const bcrypt=require("bcrypt")
const saltRounds=10

//app
const app=express();
app.use(bodyParser.urlencoded({extended:true}));

//connect mongoDB:mongodb+srv://RedBack:<password>@cluster-redback.pa0yu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://RedBack:<password>@cluster-redback.pa0yu.mongodb.net/userDatabase?retryWrites=true&w=majority", {useNewUrlParser: true})

//send value to MongoDB
app.post('/user',(req,res)=>{
    const user=new User({
        username:req.body.username,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email: req.body.email,
        password:req.body.password,
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
    user.save().catch((err) => console.log(err));

if (res.statusCode === 200)
        {
            console.log("Success send!");
        }
        else 
        {
            console.log("Something wrong?");
        }

})

//listen to 8080 port
app.listen(8080,function(req,res){
    console.log("Web server is running in 8080...");
})