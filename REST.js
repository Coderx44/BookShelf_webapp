const express = require("express");
const app = express.Router();
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({ extended: false });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userprofile");
const Book = require("./models/books");
require("dotenv").config();
app.use(express.json());

// mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection
// db.on('error', error => console.error(error))
// db.once('open', () => console.log('Connected to Mongoose'));


app.get("/users", async function (req, res) {
  User.findOne({ email: req.query.email }, async function (err, docs) {
    if (err) throw err;
    else {
      res.json(docs);
    }
  });
});



app.post("/signin", urlencoder, async (req, res) => {
  User.exists({ email: req.body.email }, async function (err, value) {
    if (value) {
      console.log("email id in use");
      res.send("email id in use");
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      var user = new User({
        Firstname: req.body.fname,
        Lastname: req.body.lname,
        email: req.body.email,
        password: hashedPassword,
      });
      user.save().catch((err) => {
        res.send(err);
      });
      console.log("email ");
      res.send("success");
    }
    console.log("should not run");
  });
});

app.post("/login", urlencoder, async function (req, res) {
  User.exists({ email: req.body.email }, function (err, value) {
    if (value) {
      User.findOne({ email: req.body.email }, async function (err, data) {
        if (data.password != undefined) {
          if (err) throw err;
          if (await bcrypt.compare(req.body.password, data.password)) {
            res.send("verified");
          } else res.send("not_verified");
        } else {
          res.send("Login with google");
        }
      });
    } else {
      res.send("NOT FOUND");
    }
  });
});

app.get("/home", async function (req, res) {
  await Book.find({}, async function (err, docs) {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      // res.send(docs[0]);
      res.json(docs);
    }
  });
});

app.get("/search/auto", async function (req, res) {
 await Book.find(
    { name: { $regex: req.query.search, $options: "i" } },
    function (err, docs) {
      if (err) {
        console.log(err);
      }
      if (!Object.keys(docs).length) {
        res.json([{}]);
      } else {
        console.log(docs[0]._id);
        res.json(docs);
      }
    }
  );
});



module.exports = app;
