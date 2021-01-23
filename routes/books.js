const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const Book = require("../models/Book"); //User model 
const { checkAuthentication } = require("../config/auth");
const uploadsFolder = require("../app");
const User = require('../models/User');

//Prikazi sve knjige
router.get("/",async (req, res) => {
    const allBooks = await Book.find().sort({ createdAt: -1 });
    res.render("allBooks.hbs",{
       books:allBooks
    });
});

//Prikazi jednu knjigu
router.get("/show/:bookId", (req, res) => {
    res.render("oneBook.hbs", {
        bookId: req.params.bookId
    });
});

//Prikazi view za dodavanje knjige 
router.get("/add", checkAuthentication, (req, res) => {
    res.render("addBook.hbs", {
        user: req.user.id
    });
});

router.post("/add",async(req,res)=>{
    const { bookname, bookdesc, bookprice, bookquant ,bookpages,bookuserID } = req.body;
    const bookimgFile = req.files.bookimg;
    const bookimgname = bookimgFile.name;
    const uploadpath = uploadsFolder+bookimgname;
    const bookimgPath= "../images/"+bookimgname;
    bookimgFile.mv(uploadpath,(err)=>{
        if(err){console.log("File upload failed",bookimgname,err);}
        else{
            console.log("File uploaded",bookimgname);
        }
    });   
    await Book.create({
        name:bookname,
        description:bookdesc,
        img:bookimgPath,
        price:bookprice,
        quantity:bookquant,
        pages:bookpages,
        user:bookuserID
    });
    const newBook = await Book.findOne({name:bookname});
    await User.findOneAndUpdate(
        {_id:req.user.id},
        {$push: { book: newBook._id } }
        );
    req.flash("success_msg","Book added");
    res.redirect("/books");
});

/*
PersonModel.update(
    { _id: person._id }, 
    { $push: { friends: friend } },
    done
);*/

module.exports = router;