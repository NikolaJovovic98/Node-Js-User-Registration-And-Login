const express = require('express');
const router = require("express").Router();
const {checkAuthentication} = require("../config/auth");

//Welcome page
router.get('/', (req,res)=>{
    res.render('home.hbs');
});

//Dashboard page
router.get('/dashboard',checkAuthentication, (req,res)=>{
    res.render('dashboard.hbs',{
        user:req.user.name,
        id:req.user.id,
        email:req.user.email
    });
});


module.exports = router; 