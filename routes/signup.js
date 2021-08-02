const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const path=require('path');
const fs=require('fs');
const urlencoder=bodyparser.urlencoded({extended :false});
const bcrypt = require('bcrypt');
require('dotenv').config();
const User=require('../models/userprofile');




app.get('/',async function (req, res) {
    if(req.session.user)
    res.redirect('/');
    else{
        var data=[false,false];
        if(req.session.exists)
        data[0]=true;
        if(req.session.pass)
        data[1]=true;
        res.render('signup',{user:data});
    }
    });

app.post('/signin',urlencoder, async (req, res) => {
    User.exists({ email: req.body.email },async function (err, value) {
        if(value){
            req.session.exists=true;
            req.session.pass=false;
            console.log("email id in use");
            res.redirect('/signup')
        }
    else{
    if(req.body.password===req.body.password2){
        console.log(req.body.fname)
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    
        var user = new User({
            Firstname:req.body.fname,
            Lastname:req.body.lname,
            email: req.body.email,
            password: hashedPassword,
        });
        user.save().then(data => {
            console.log(data);

        }).catch(err => {
            console.log(err);
        });
    
        res.redirect('/contact');
    }
    else{
        req.session.exists=false;
        req.session.pass=true;
    res.redirect('/signup');
    }
    }
    });
});
module.exports=app;
