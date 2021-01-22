const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const Books = require("../models/User"); //User model 
const {checkAuthentication} = require("../config/auth");

router.get("/",(req,res)=>{
    res.render("allBooks.hbs");
});

router.get("/show/:bookId",(req,res)=>{
    res.render("oneBook.hbs",{
        bookId:req.params.bookId
    });
});

//checkAuthentication
router.get("/add",(req,res)=>{
    res.render("addBook.hbs"); 
});


module.exports = router;