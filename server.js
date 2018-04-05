const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const assert = require('assert');
const uuid = require('uuid/v1');
const session = require('express-session');
const getAge = require('get-age')


mongoose.connect('mongodb://localhost/catfishdb');
var db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Init App


// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// configure sessions
app.use(session({
  genid: function(request) {
    return uuid();
  },
  resave: false,
  saveUninitialized: false,
  //cookie: {secure: true},
  secret: 'apollo slackware prepositional expectations'
}));

// Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// database schema
var Schema = mongoose.Schema;
var userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  hashedPassword: String,
  birthDate: String,
  gender: String,
  school: String,
  location: String,
  img1: String ,
  img2: String,
  img3: String ,
  bio: String
}, {collection: 'users'});
var User = mongoose.model('user', userSchema);

// Home Route
app.get('/', function(req, res){
  res.render('index', {
    title:'Catfish'
  });
});

// Add Route
app.get('/mainpage/', function(req,res){
  res.render('main_page', {
    title:'Catfish'
  });
});

// Add Route
app.get('/about/', function(req,res){
  res.render('about', {
    title:'About'
  });
});

// Add Route
app.get('/contact/', function(req,res){
  res.render('contact', {
    title:'Contact'
  });
});


app.get('/register/', function(request, response) {
  response.render('register', {title: 'Register'});
});

app.post('/processRegistration/', function(request, response) {
  var firstName = request.body.firstName;
  var lastName = request.body.lastName;
  var email = request.body.email;
  var password = request.body.pwd;
  var hashedPassword = bcrypt.hashSync(password);
  var bio = request.body.bio;
  var gender = request.body.gender;
  var school = request.body.school;
  var location = request.body.location;
  var birthDatewithTime =  new Date(request.body.birthDate);
  var birth = birthDatewithTime.toDateString();


  User.find({email: email}).then(function(results){
    if(results.length > 0){
      response.render('register', {title: 'Register',errorMessage: 'Email Already Taken'});
    }
  });

  if(!firstName || !lastName || !email || !password || !request.body.birthDate || !school || !location){
    response.render('register', {title: 'Register',errorMessage: 'One of inputs not filled'});
  }

  else{
    if(gender == "Male"){
      var newUser = new User({firstName: firstName,
                              lastName: lastName,
                              email: email,
                              hashedPassword: hashedPassword,
                              gender: gender,
                              birthDate: birth,
                              school: school,
                              location:location,
                              img1: "https://goo.gl/sQu7Do",
                              img2: "https://goo.gl/kAoNQH",
                              img3: "https://goo.gl/mEhwYZ",
                              bio: bio});

      newUser.save(function(error) {
        if (error) {
          console.log('Unable to register: ' + error);
          response.render('register', {errorMessage: 'Unable to register user.'});
        }
        else {
          response.render('login', {title: 'Please Log In',
          errorMessage: ''});
        }
      });
    }

    else{
      var newUser = new User({firstName: firstName,
                              lastName: lastName,
                              email: email,
                              hashedPassword: hashedPassword,
                              gender: gender,
                              birthDate: birth,
                              school: school,
                              location: location,
                              img1: "https://goo.gl/wgwWiY",
                              img2: "https://goo.gl/EMnmEi",
                              img3: "https://goo.gl/YHNVRT",
                              bio: bio});
      newUser.save(function(error) {
        if (error) {
          console.log('Unable to register: ' + error);
          response.render('register', {errorMessage: 'Unable to register user.'});
        }
        else {
          response.render('login', {title: 'Please Log In',
                                  errorMessage: ''});
        }
      });
    }
  }
});

app.get('/login/', function(request, response) {
  response.render('login', {title: 'Please Log In',
                            errorMessage: ''});
});

app.post('/processLogin/', function(request, response) {
  var email = request.body.email;
  var password = request.body.pwd;
  User.find({email: email}).then(function(results) {
    if (results.length == 0) {
      // Login failed
      response.render('login', {title: 'Please Log In',
                                          errorMessage: 'Email does not exist'});
    }

    else {
      // login success
      if (bcrypt.compareSync(password, results[0].hashedPassword)) {
        var user = User.findOne({email: email},  function(err, doc){
          var age = getAge(doc.birthDate);
            response.redirect('/mainpage/');


        app.get('/settings/', function(request, response){
          response.render('settings', {firstName: doc.firstName,
                                       lastName: doc.lastName,
                                       email: doc.email,
                                       bio: doc.bio,
                                       school: doc.school,
                                       title: "Settings"});
        });
      });
    }

      else{
        response.render('login', {title: 'Please Log In',
                                            errorMessage: 'Password Incorrect'});
      }
    }
  });
});



app.post('/processUpdate/', function(request, response) {
  var firstName = request.body.firstName;
  var lastName = request.body.lastName
  var email = request.body.email;
  var bio = request.body.bio;
  var school = request.body.school;

  var userData = {firstName: firstName,
                  lastName: lastName,
                  school: school,
                  bio: bio};

    User.find({email: email}).then(function(results) {
    if (results.length > 0) {
        User.update({email: email},
                        userData,
                        {multi: false},
                        function(error, numAffected) {
        if (error || numAffected != 1) {
          console.log('Unable to update student: ' + error);
          response.render('profile_page', {firstName: firstName, Message: error});
        }
        else {
          response.render('profile_page', {firstName: firstName});
        }
      });
    }

    else {

      response.render('login', {title: 'Please Log In',
                                errorMessage: ''});
    }
  });


});



app.get('/logout/', function(request, response) {
  request.session.email = '';
  response.redirect('/');
});

// Start server
app.listen(3000, function(){
  console.log('Server started on port 3000');
});
