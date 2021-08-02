require('dotenv').config();
const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const urlencoder=bodyparser.urlencoded({extended :false});
const bcrypt=require('bcrypt');
const Book=require('../models/books');
const multer=require('multer');
const jwt=require('jsonwebtoken');
const checkAuth =require('./checkAuth');
const { session } = require('passport');
app.use(express.json());
// const authenticateToken = require('./login');
const storage =multer.diskStorage({
  destination :function(req,file,cb){
cb(null,'./uploads/');
  },
  filename:function(req,file,cb){
cb(null, "book"+Date.now().toString()+".jpg");
  }
})

const fileFilter=function(req,file,cb){
  if(imageMimeTypes.includes(file.mimetype))
  cb(null,true);
  else
  cb(null,false);
}
const upload=multer({storage:storage,
limits:{
  fileSize:1024*1024*12
},
fileFilter:fileFilter
});
const imageMimeTypes = ['image/jpeg', 'image/png','image/jpg']
app.get('/show',function(req,res){
  // if(req.query.search){
  //   const regex= {$regex:req.query.search,$options:'$i'};
  //   await Book.find({name:regex},async function(err,data){
  //     console.log(data);
  //   })
  // }
  // console.log(req.session.user);
  Book.find({uploadedBy : req.session.user}, function (err, docs) { 
    if (err){ 
        console.log(err); 
    } 
    else{ 
      // data = {docs,user :true};
        res.render('show',{data : {docs,user :true}});
        // res.send(docs[0]);
    } 
}); 


  // res.redirect('/')
 })
//  app.get('/show/:id',function(req,res){
//   Book.findById(req.params.id, function (err, docs) { 
//     if (err){ 
//         console.log(err); 
//     } 
//     else{ 
//         res.render('show',{docs});
//     } 
// }); 
   
//  })

app.get('/delete',async function(req, res){
  Book.findByIdAndDelete(req.query.id, async function(err){
    if(err)
      console.log(err);
    else
    res.redirect('/books/show');
  })
})



app.get('/search',function(req,res){
  Book.find({name:{ "$regex" : req.query.search , "$options" : "i"}}, function (err, docs) { 
    if (err){ 
        console.log(err); 
    } 
    else{ 
      // data = {docs,user :false};
        res.render('show',{data : {docs,user :false}});
    } 
})
});




app.get('/search/auto',function(req,res){
  Book.find({name:{ "$regex" : req.query.search , "$options" : "i"}}, function (err, docs) { 
    if (err){ 
        console.log(err); 
    } 
    else{ 
        res.json(docs);
    } 
})
});
app.get('/add',function(req,res){
  res.setHeader("Authoriztion" ,"496a3414d360ea45e62c427dc3271ded74c7acc21753cf92dec2cb09acf7a48fd4e39472bd2230215f48647e01d36c12793fa032444bed571067b98a22ae4dfe" );
  if(req.session.user)
  res.render('cover');
  else
  res.redirect('/contact');
})
app.post('/', upload.single('cover'), async function(req,res){
  if(req.session.user)
  {
   console.log(req.file);
  const book=new Book({
    uploadedBy : req.session.user,
    name:req.body.bookname,
    price:req.body.price,
    coverImage:req.file.path,
    category: req.body.category
  });
  await book.save();
    res.redirect('/');
}
else
res.redirect('/contact');
});

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    coverEncoded=JSON.stringify(coverEncoded);
    console.log(coverEncoded);
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }


 

  function authenticateToken(req,res,next){
    var authHeaders ;
    console.log(req.headers['authorization']);
    authHeaders=''+req.headers['authorization'];
    const tokens = ''+authHeaders.split(" ")[1];
    // console.log(tokens);
    if(tokens==null) return res.sendStatus(401);
    jwt.verify(authHeaders.substring(11),process.env.ACCESS_TOKEN_SECRET,function(err,user){
        if(err) return res.sendStatus(403)
        req.user=user;
        return next();
    })
};

module.exports=app;
