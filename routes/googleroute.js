const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const urlencoder=bodyparser.urlencoded({extended :false});
const passport=require('passport');
const cookie=require('cookie-session');
require('dotenv').config();
require('./passport-setup');

app.use(passport.initialize());
app.use(passport.session());

    //for google login.
app.get('/',passport.authenticate('google',{scope:['profile','email']}));
app.get('/callback',passport.authenticate('google',{failureRedirect:'/contact'})
,function(req,res){
currentUser=req.user.email;
    res.redirect('/')
}); 
    
module.exports=app;