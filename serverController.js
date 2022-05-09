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

//send user value to MongoDB
async function PostNewUser(req, res) {
    try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);

        var img = fs.readFileSync("./uploads/default.jpg");
        var encode_img = img.toString('base64');
        var final_img = {
            contentType:"image/jpeg",
            data:new Buffer(encode_img,'base64')
        };

        const user=new User({
            username:req.body.username,
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email: req.body.email,
            password:hash,
            redbackCoins:req.body.redbackCoins,
            telephone:req.body.telephone,
            userLevel:req.body.userLevel,
            img:final_img
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
    } catch (err) {
        console.error(`Error while posting new user:`, err.message);
    }
}

//find all user
async function FindAllUser(req, res) {
    try {
        User.find((err, list)=>{
            if (err) {res.send(err)}
            else {res.send(list)}
        })
    } catch (err) {
        console.error(`Error while getting all users:`, err.message);
    }
}

//find a user with username: return password
async function FindUsername(req, res) {
    try {
        User.findOne({username: req.params.username},['password'], (err, list)=>{
            if (list) (res.send(list.password))
            else res.send("Cannot find username")
        })
    } catch (err) {
        console.error(`Error while getting user by username:`, err.message);
    }
}

//find specific user with user ID or username
async function FindUser(req, res) {
    try {
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
    } catch (err) {
        console.error(`Error while getting user by ID:`, err.message);
    }
}

//delete with user ID or username
async function DeleteUserID(req, res) {
    try {
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
    } catch (err) {
        console.error(`Error while deleting user by ID:`, err.message);
    }
}

//change with user ID or username
async function UpdateUser(req, res) {
    try {
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
                            email: req.body.email,}
                        },(err)=>{
                                if(!err){res.send('Successfully update a user with username')}
                                else {
                                    res.send("User does not exist");
                                }
                            }
                    )
                }
            }
        )
    } catch (err) {
        console.error(`Error while updating user:`, err.message);
    }
}

//Upload picture for certain user with user ID or username
async function UploadUserPicture(req, res) {
    try {
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
                if (!err) {res.send('Successfully upload a picture for a user with user id')}
                else {
                    User.update(
                        {username: req.params.id},
                        {$set:{img:final_img
                            }},
                        (err)=>{
                            if (!err) {res.send('Successfully upload a picture for a user with username')}
                            else {
                                res.send("User does not exist")
                            }
                        }
                    )
                }
            }
        )
    } catch (err) {
        console.error(`Error while updating user picture:`, err.message);
    }
}

// Get profile picture with user ID or username
async function GetUserPicture(req, res) {
    try {
        User.findById(req.params.id, (err,user)=> {
            if (!err) {
                res.contentType(user.img.contentType);
                res.send(user.img.data);
            } else {
                User.findOne({username:req.params.id},(err,user)=>{
                    if (user) {
                        res.contentType(user.img.contentType);
                        res.send(user.img.data);
                    } else {
                        res.send(err);
                    }
                })
            }
        });
    } catch (err) {
        console.error(`Error while getting user picture:`, err.message);
    }
}

module.exports = {
    PostNewUser,
    FindAllUser,
    FindUsername,
    FindUser,
    DeleteUserID,
    UpdateUser,
    UploadUserPicture,
    GetUserPicture
}