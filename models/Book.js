/*jedan korisnik može da obavlja
operacije nad više knjiga, a sa jednom knjigom može da upravlja samo jedan
korisnik*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
   name:{
       type:String,
       minlength:3,
       maxlength:15,
       required:true,
       unique:true
   },
   description:{
       type:String,
       minlength:10,
       maxlength:150
   },
   img:{
       type: String,
       default:"../images/defaultbook.png"
   },
   price:{
       type:Number,
       required:true,
       min:1,
       max:10000
   },
   quantity:{
       type:Number,
       default:1,
       min:1,
       max:10
   },
   pages:{
       type:Number,
        min:10,
        max:5000,
        default:10
   },
   user: {
       type:Schema.Types.ObjectId,
       required:true,
       ref: 'User'
   }
},{timestamps:true});

bookSchema.virtual("possibleEarnings")
          .get(function () { 
                return this.price*this.quantity;
            });

const Book = mongoose.model("Book",bookSchema);

module.exports = Book;