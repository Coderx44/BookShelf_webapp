const express = require('express');
const app = express.Router();
const bodyparser = require('body-parser');
const urlencoder = bodyparser.urlencoded({ extended: false });
const bcrypt = require('bcrypt');
const User = require('../models/userprofile');
require('dotenv').config();
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
app.use(express.json());



app.get('/', async function (req, res) {
    if (req.session.user)
        res.redirect('/');
    else
        res.render('contact');
});
// app.get('/add',authenticateToken,function(req,res){
//     // if(req.session.user)
//     res.render('cover');
//     // else
//     // res.redirect('/contact');
//   })
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log("session destroyed..logged out");
    })
    res.redirect('/');
})

app.get('/forgot', function (req, res) {
    console.log(req.session.setPass);
    if (req.session.setPass == undefined)
        req.session.setPass = true;
    if (req.session.setPass)
        res.render('forgotPass');
    else
        res.redirect('/contact');
})



app.post('/forgot', urlencoder, function (req, res) {
    console.log(req.session.setPass);
    if (req.session.setPass) {
        User.exists({ email: req.body.email }, (err, docs) => {
            if (docs) {
                req.session.OTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
                req.session.email = req.body.email;
                var transporter = nodemailer.createTransport({

                    service: 'gmail',
                    auth: {
                        user: 'Bhosaleprasad849@gmail.com',
                        pass: '8693083449'
                    }

                })

                var mailOptions = {
                    from: "Bhosaleprasad849@gmail.com",
                    to: req.body.email,
                    subject: "OTP related",
                    text: "hii this is your OTP \n" + req.session.OTP,

                }
                transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log("error :" + error);
                    }
                    else res.render('otp');
                });
            }
            else {
                res.send("U dont have an account")
            }
        })
    }
    else
        res.redirect('/contact');
})

app.post('/verify', urlencoder, function (req, res) {
    if (req.session.setPass) {
        if (req.session.OTP == req.body.otp)
            res.render('resetPass');
        else
            res.redirect('/contact/forgot');
    }
    else res.redirect('/contact');

})


app.post('/reset', urlencoder, async function (req, res) {
    if (req.session.setPass) {
        if (req.body.password == req.body.password1) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await User.findOneAndUpdate({ email: req.session.email }, { password: hashedPassword });
            req.session.setPass = false;
            res.redirect('/contact');
        }
        else
            res.render('resetPass');
    }
    else res.redirect('/contact');

})



app.post('/login', urlencoder, async function (req, res) {
    User.exists({ email: req.body.email }, function (err, value) {
        if (value) {

            User.findOne({ email: req.body.email }, async function (err, data) {
                if(data.password != undefined){
                if (err)
                    throw err;
                if (await bcrypt.compare(req.body.password, data.password)) {
                    req.session.user = data.email;                                                       
                    const user = { name: data.email };
                    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                    console.log(accessToken);
                    res.cookie("SessionId", accessToken);
                    res.redirect('/');
                }
                else
                    res.render('contact');
            }
            else
            {
                res.send("Login with google");
            }
            });
        }
        else {
            console.log("NOT FOUND");
            res.redirect('/contact');
        }
    });

});


module.exports = app;
// module.exports =  function authenticateToken(req,res,next){
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if(token==null) return res.sendStatus(401);
//     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
//         if(err) return res.sendStatus(403)
//         req.user=user;
//         next();
//     })
// };



