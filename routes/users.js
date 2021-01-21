const express = require('express'); //express framework
const router = require("express").Router(); //izvuci Router tj mogucnost rutiranja iz expressa
const User = require("../models/User"); //User model 
const bcrypt = require("bcrypt");//za hasovanje pasvorda
const passport = require("passport");


//Login Get
router.get('/login', (req, res) => {
    res.render('login.hbs');
});

//Register Get
router.get('/register', (req, res) => {
    res.render('register.hbs');
});

//Register Post
router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
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
                password:hashedPassword
            });
            req.flash("success_msg","You are now registered.Feel free to login anytime !");
            res.redirect("/users/login");
        }
    }
});

//Login post
router.post("/login",(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

//Logout

router.post("/logout",(req,res)=>{
    req.logOut();
    req.flash('success_msg',"You just logged out.");
    res.redirect("/users/login");
});


module.exports = router;