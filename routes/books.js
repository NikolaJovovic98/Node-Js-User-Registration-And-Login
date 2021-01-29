const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const Book = require("../models/Book"); //User model 
const { checkAuthentication } = require("../config/auth");
const uploadsFolder = require("../app");
const User = require('../models/User');
const { bookPermission } = require("../config/bookAuth");
const fs = require("fs");
const { checkQuantity } = require("../config/bookQuantityCheck");
const mailSender = require("../services/mailer");
const csvMaker = require("../services/csvMaker");

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
    const pe = book.possibleEarnings; // 6*3 = 18e
    res.render("oneBook.hbs", {
        bookName: book.name,
        bookPrice: book.price,
        bookQuant: book.quantity,
        bookPages: book.pages,
        bookDesc: book.description,
        bookImg: book.img,
        user: userWhoAddedBook.name,
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
//Nakon sto logovani korisnik udje da pregleda odredjenu knjigu a ta knjiga je dodata od strane njega
//on ima mogucnost da je obrise nakon sto je obrise radi se sljedece:
//const book nam treba da bi iz te knjige koju brisemo izvadili key img koji sadrzi path
//tj putanju do slike knjige koja se nalazi u folderu images u imgName rezemo samo ime fajla npr slika.jpg bez ../images
//jer to imamo u uploadsFolder to sve spajamo u fullPath i to koristimo u fs.unlikn da bi obrisali sliku 
//brisanje Book-a se vrsi pomocu findOneAndDelete a brisanje knjige iz User-ovog niza knjiga pod nazivom book vrsimo tako sto
//nadjemo korisnika koji je postavio knjigu i pomocu $pull-a brisemo onu knjigu koja se poklapa sa id-jem knjige koju brisemo 
router.post("/delete/:bookName",checkAuthentication, async (req, res) => {
    const book = await Book.findOne({name:req.params.bookName});
    await Book.findOneAndDelete({ name: req.params.bookName });
    await User.findOneAndUpdate({_id:book.user},{
        $pull : {book:book._id}
    });
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
//Dodaj objasnjenje za adding book obavezno za csv,mailer
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
    const newBookObject = [newBook];
    await csvMaker(newBookObject);
    const admins = await User.find({role:1});
    const adminsMails = admins.map(admin=>{return admin.email});
    await mailSender(adminsMails,req.user.name,newBook.name);
    req.flash("success_msg", "Book added");
    res.redirect("/books");
});

/*
    const newBookObject = {
        name:newBook.name,
        description:newBook.description,
        price:newBook.price,
        quantity:newBook.quantity,
        pages:newBook.pages
    }
async function makeCsv(bookObject){
     csvMaker(bookObject);
}
  makeCsv(newBookObject)
    .then(async(result) => {
        const admins = await User.find({role:1});
        const adminsMails = admins.map(admin=>{return admin.email});
        await mailSender(adminsMails,req.user.name,newBook.name);
    })
    .catch((err) => {
        console.log(err);
    });
*/

router.post("/inc/:bookName",checkQuantity,async(req,res)=>{
    await Book.findOneAndUpdate({name:req.params.bookName},{
        $inc:{quantity:1}
    });
    req.flash("success_msg","Quantity incremented by 1");
    res.redirect(`/books/show/${req.params.bookName}`);
});

router.post("/dec/:bookName",checkQuantity,async(req,res)=>{
    await Book.findOneAndUpdate({name:req.params.bookName},{
        $inc:{quantity:-1}
    });
    req.flash("success_msg","Quantity decremented by 1");
    res.redirect(`/books/show/${req.params.bookName}`);
});

//Prikazi sve knjige u odredjenom rangu cijene koje korisnik postavi
//Posto trebamo da procitamo iz url-a /books/filter?fromPrice=broj1&toPrice=broj2
//to se cita pomocu req.query.fromPrice zbog toga moramo koristiti GET metodu
//samo citamo rezultate iz baze tako da to smijemo
//u filteredBooks stavljamo sve knjige cija je cijena u rangu ovih iz query
//to postizemo sa $lt tj less then i $gt tj greater then
router.get("/filter",async(req,res)=>{
    const filteredBooks = await Book.find({
        price:{$gt:req.query.fromPrice,$lt:req.query.toPrice}
    });
    res.render("allBooks.hbs",{
        books:filteredBooks
    });
});


module.exports = router;