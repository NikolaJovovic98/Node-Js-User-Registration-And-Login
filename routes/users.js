const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const User = require("../models/User"); //User model 
const bcrypt = require("bcrypt");//za hasovanje pasvorda
const passport = require("passport");
const {checkAuthentication} = require("../config/auth");
//All Users
router.get('/',async (req, res) => {
    const allUsers = await User.find().sort({ createdAt: -1 });
    res.render("allUsers.hbs",{
        users:allUsers
    });
});

//Login Get
router.get('/login', (req, res) => {
    if(req.user){
        res.render('dashboard.hbs',{
            user:req.user.name,
        });
    }
    else{
        res.render('login.hbs');
    }
});

//Register Get
router.get('/register', (req, res) => {
    if(req.user){
        res.render('dashboard.hbs',{
            user:req.user.name,
        });
    }
    else{
        res.render('register.hbs');
    }
});

//Register Post
router.post('/register', async (req, res) => {
    const { name, email, password, password2 ,role } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2 || !role) {
        errors.push({ msg: "Please fill in all fields." })
    }
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match." })
    }
    if (password.length < 5) {
        errors.push({ msg: "Password should be at least 5 characters." })
    }
    if (errors.length > 0) {
        res.render("register.hbs", {
            errors
        });
    } else {
        const user = await User.findOne({ email: email });
        if (user) {
            errors.push({msg:"User already exists in database."});
            res.render("register.hbs",{
                errors
            });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password,10);
            await User.create({
                name: req.body.name,
                email: req.body.email,
                password:hashedPassword,
                role:req.body.role
            });
            req.flash("success_msg","You are now registered.Feel free to login anytime !");
            res.redirect("/users/login");
        }
    }
});

//Login post
//U login post-u dodajemo passport.authenticate koji kao prvi parametar prihvata dje se vrsi autentikacija kod nas je lokalno
//kao drugi prihvata objekat sa kljucevima ako je autentikacija dobro prosla tamo u passport.js smo poslali user-a koji je loginovan
//e sad on biva proslijedjen i kroz successRedirect naravno uz redirect na stranicu /dashboard ,failureRedirect ce se aktivirati ako nije 
//autentikacija dobro prosla a failureFlash:true stavljamo da bi prikazali poruke za npr los pasvord ili nepostojeceg user-a 
router.post("/login",(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true,
        successFlash:true
    })(req,res,next); 
});

//Logout
router.post("/logout",(req,res)=>{
    req.logOut();
    req.flash('success_msg',"You just logged out.");
    res.redirect("/users/login");
});

module.exports = router;