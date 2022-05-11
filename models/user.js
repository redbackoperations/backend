const mongoose = require("mongoose")
const validator = require("validator")
const userSchema = new mongoose.Schema(
    {
        username:String,
        firstname:String,
        lastname:String,
        email: {type: String,
            trim:true,
            lowercase:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email is not valid!')
            }
        }},
        password:{type:String,minlength:8,required:true},
        redbackCoins:{type:Number,default:0},
        telephone:Number,
        userLevel:{type:Number,default:0},
        followers: [{username : String }],
        following: [{username : String }],
        img:{data:Buffer,contentType: String}
    }
)
module.exports  =  mongoose.model("User", userSchema)
