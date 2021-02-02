const express = require('express');
const router = require("express").Router();//Pravimo sopstveni router koji ce raditi isto sto i app.get/post itd jer koristi expressov Router()
const {checkAuthentication} = require("../config/auth");//Stavljamo {} oko imena jer u config/auth imamo objekat sa key-jem pod istim imenom
//mogli smo da stavimo i ovo const checkAuthentication = require("../config/auth").checkAuthentication;

//Welcome page
//Renderovanje pocetne stranice
router.get('', (req,res)=>{
    res.render('home.hbs')
});

//Dashboard page
//Dashboard je pocetna stranica nakon sto se korisnik loguje na sajt
//da bi pristupili ovoj stranici idemo na /dashboard a da bi zabranili pristup ubacujemo
//middlewer koji provjerava da li je korisnik koji pokusava da udje autentifikovan ako jeste
//ide na next() tj na (req,res)->{...} i tu radi svoje ako nije pomocu ovoga checkAuth..
//koji ima svoj req,res salje poruku fles i redirektuje na login stranicu 
router.get('/dashboard',checkAuthentication, (req,res)=>{
    if(req.user.role===1){
        res.redirect('/users/admin');
    }else{
        res.render('dashboard.hbs',{
            user:req.user.name,
        });
    }
});

module.exports = router; 