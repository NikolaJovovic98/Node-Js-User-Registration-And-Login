const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        min:3
    },
    email:{
        type:String,
        required:true,
        min:6
    },
    password:{
        type:String,
        required:true,
        min:5
    },
    date:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

const User = mongoose.model("User",userSchema);

module.exports = User;