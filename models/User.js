/*jedan korisnik može da obavlja
operacije nad više knjiga, a sa jednom knjigom može da upravlja samo jedan
korisnik*/

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
    role:{
        type:Number,
        required:true
    },
    book:[{
        type:Schema.Types.ObjectId,
    }]
},{timestamps:true});

const User = mongoose.model("User",userSchema);

module.exports = User;