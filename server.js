const express=require('express');
const app = express();
const bodyparser=require('body-parser');
const path=require('path');
const fs=require('fs');
const urlencoder=bodyparser.urlencoded({extended :false});
const mongoose=require('mongoose');
const passport=require('passport');
const cookie=require('cookie-session');
var cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();


app.set('view engine', 'ejs') ;

app.use('/assests',express.static('assests'));

app.use('/uploads',express.static('uploads'))
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true }, {useUnifiedTopology: true });
const db = mongoose.connection

db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

const bookRoute = require('./routes/books');
const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const googleroute = require('./routes/googleroute');
const Book = require('./models/books');
const api = require('./REST');

var Books,ret;

async function getBooks(req, res, next){
await Book.find({}, async function (err, docs) { 
    if (err){ 
        console.log(err); 
    } 
    else{ 
      ret = docs;
        // res.send(docs[0]);
    } 
}); 
next();
}

app.get('/load',function(req,res)
{
    console.log(ret.length);
    if(req.session.count)
    {
        if(req.session.count<=ret.length)
        {
            if(req.session.count+4<=ret.length)
            Books=ret.slice(req.session.count, req.session.count+4);
            else
            Books=ret.slice(req.session.count, ret.length);
        }
        else{
        Books=[];
        }
        req.session.count+=4;
    }
  
    res.json(Books);
});
app.get('/', getBooks, function (req, res) {

    req.session.count=8;
    Books=ret.slice(0,8);
        if (req.session.views) {
            req.session.views+=1;
            console.log(req.session.user)
            console.log(req.session.views);
        }
        else {
            req.session.views = 1;
            console.log(req.session.user)
            console.log(req.session.views);
        }
        if(req.session.user)
        res.render('page',{data:{user:true,Books}});
        else
        res.render('page',{data:{user:false,Books}});
    });
 
app.use('/contact',loginRoute);
app.use('/signup',signupRoute);
app.use('/google',googleroute);
app.use('/books',bookRoute);
app.use('/api', api);


app.listen(process.env.PORT || 3000)