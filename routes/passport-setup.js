const passport=require('passport')
require("dotenv").config();
var User=require('../models/userprofile');
const strategy=require('passport-google-oauth2').Strategy
passport.serializeUser(function(user,done){
    // console.log(user);
    done(null,user);
});

passport.deserializeUser(function(user,done){
    // console.log(user);
 done(null,user);
   
 
    // done(null,user);
});

passport.use(new strategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true
},function(req,accessToken,refreshtoken,profile,done){
    // console.log(profile);
    User.exists({email:profile.email},(err,value)=>{
        if (value){
            User.findOne({email:profile.email},function(err,data){
                if (err) throw err;
            //    console.log(data);
            req.session.user=data.email;
               done(null,data);
            });
        }
        else{
            var user= new User({
                Firstname:profile.given_name,
                Lastname:profile.family_name,
                email:profile.email,
            });
            user.save().then(data=>{
                // console.log(data);
                req.session.user=data.email;
                done(null,data);
            }).catch(err=>{
                console.log(err);
            });
            
        }
});
}));
