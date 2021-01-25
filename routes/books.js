const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const Book = require("../models/Book"); //User model 
const { checkAuthentication } = require("../config/auth");
const uploadsFolder = require("../app");
const User = require('../models/User');
const { bookPermission } = require("../config/bookAuth");
const fs = require("fs");

//za brisanje slike fs.unlink(path, callback) var fs = require('fs');

//Prikazi sve knjige
router.get("/", async (req, res) => {
    const allBooks = await Book.find().sort({ createdAt: -1 });
    res.render("allBooks.hbs", {
        books: allBooks
    });
});

//Prikazi jednu knjigu
router.get("/show/:bookName", bookPermission, async (req, res) => {
    const book = await Book.findOne({ name: req.params.bookName });
    const userWhoAddedBook = await User.findOne({ _id: book.user });
    res.render("oneBook.hbs", {
        bookName: book.name,
        bookPrice: book.price,
        bookQuant: book.quantity,
        bookPages: book.pages,
        bookDesc: book.description,
        bookImg: book.img,
        user: userWhoAddedBook.name
    });
});

//Prikazi formu za update knjige get 
router.get("/update/:bookName", checkAuthentication, async (req, res) => {
    const updateBookInfo = await Book.findOne({ name: req.params.bookName });
    res.render("updateBookForm.hbs", {
        inputBookName: updateBookInfo.name,
        inputBookDesc: updateBookInfo.description,
        inputBookPrice: updateBookInfo.price,
        inputBookQuant: updateBookInfo.quantity,
        inputBookPages: updateBookInfo.pages,
    });
});

//Update knjigu post 
router.post("/update/:bookName", async (req, res) => {
    await Book.findOneAndUpdate({name:req.params.bookName},{
        name:req.body.bookname,
        description:req.body.bookdesc,
        price:req.body.bookprice,
        quantity:req.body.bookquant,
        pages:req.body.bookpages
    });
    const redirectBook = await Book.findOne({name:req.body.bookname});
    req.flash("success_msg","Successful Updated Book Information");
    res.redirect(`/books/show/${redirectBook.name}`);
});

//Delete Obrisi knjigu
router.post("/delete/:bookName",checkAuthentication, async (req, res) => {
    const book = await Book.findOne({name:req.params.bookName});
    await Book.findOneAndDelete({ name: req.params.bookName });
    const imgName = book.img.substring(book.img.lastIndexOf("/") + 1);
    const fullPath = uploadsFolder+imgName;
    fs.unlink(fullPath, (err)=>{
        if(err){console.log("Error in deleting image: "+err);}
        else{
            console.log("Image successfully deleted.");
        }
    });
    req.flash("success_msg","Successful deleted book!");
    res.redirect(`/users/show/${req.user.name}`);
});

//Prikazi view za dodavanje knjige 
router.get("/add", checkAuthentication, (req, res) => {
    res.render("addBook.hbs", {
        user: req.user.id
    });
});

router.post("/add", async (req, res) => {
    const { bookname, bookdesc, bookprice, bookquant, bookpages, bookuserID } = req.body;
    const bookimgFile = req.files.bookimg;
    const bookimgname = bookimgFile.name;
    const uploadpath = uploadsFolder + bookimgname;
    const bookimgPath = "../images/" + bookimgname;
    bookimgFile.mv(uploadpath, (err) => {
        if (err) { console.log("Image upload failed", bookimgname, err); }
        else {
            console.log("Image uploaded", bookimgname);
        }
    });
    await Book.create({
        name: bookname,
        description: bookdesc,
        img: bookimgPath,
        price: bookprice,
        quantity: bookquant,
        pages: bookpages,
        user: bookuserID
    });
    const newBook = await Book.findOne({ name: bookname });
    await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { book: newBook._id } }
    );
    req.flash("success_msg", "Book added");
    res.redirect("/books");
});

module.exports = router;