const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    body:{
        type:String,
        required:true,
        minlength:3,
        maxlength:150
    },
    book:{
        type:Schema.Types.String,
        required:true,
        ref:"Book"
    },
    user:{
        type:Schema.Types.String,
        required:true,
        ref:"User"
    }
},{timestamps:true});

const Comment = mongoose.model("Comment",commentSchema);

module.exports = Comment;