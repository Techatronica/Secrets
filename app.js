//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//Can declare const Schema = new mongoose.Schema;
//const nameSchema = new Schema({}); saves having to type 'new mongoose.Schema;'
//This no longer a javascript object but from the mongoose schema class.
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//at this stage we are not using .evn variables
// const secret = process.env.Some_Long_Unguessable_String;

// This is our encryption key, secrets.

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:["password"] });

const User = new mongoose.model("User", userSchema);
//user document that uses bodyParser req.body.name/ID of user input.
// const newUser = new User ({
//email: req.body.username,
// password: req.body.password
// });

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});
//The post route
app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
//saves the newUser document to User collection.
  newUser.save(function(err){
    if (err) {
      console.log(err);
//If there are no errors then the secrets.ejs page gets rendered in the browser.
    } else {
      res.render("secrets");
    }
  });
});
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
//Passes the results to the callback "foundUser".
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser){
        if (foundUser.password === password){
          console.log(password);//This will display the password as plain text decoded
          res.render('secrets');//die to the decryption has be done by mongoose.
        }
      }
    }
  });
});


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
