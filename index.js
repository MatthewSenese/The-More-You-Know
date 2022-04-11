//Noteify Final Project

// import firebase module
var fb = require('firebase')

// initialize the app
var appIni = fb.initializeApp({
  apiKey: "AIzaSyBQZNSXZK1EVIoez75smdeqEgS3yu3rwi0",
  authDomain: "noteify-d7193.firebaseapp.com",
  databaseURL: "https://noteify-d7193-default-rtdb.firebaseio.com/",
  projectId: "noteify-d7193",
  storageBucket: "noteify-d7193.appspot.com",
  messagingSenderId: "259103554370",
  appId: "1:259103554370:web:bb31e247835601343266db",
  measurementId: "G-DXJET6RER1" });

// create firebase instance
var firebaseDB = fb.database()

// use express and create app object
const express = require('express')
const app = express()
var url = require('url')
app.use(express.static(__dirname + '/static'))
const port = process.env.PORT || 8080;

// main function to send data to the firebase database
app.get('/submitNote', (request, response) => {

  // get title and note data from static page
  var inputs = url.parse(request.url, true).query
  const title = (inputs.title)
  const note = (inputs.note)
  // get username and put it as ref below

  // send data to database with currently logged in user
  fb.auth().onAuthStateChanged(function(user) {
    if (user) {

      // user ID identifies user in database with their title and notes
      var uid = user.uid
      firebaseDB.ref(`${uid}/` + title).set({ theNote: note});
    }
  });
})

app.get('/login', (request, response) => {

  // get logged in state
  fb.auth().onAuthStateChanged((user) => {
    // if user is NOT logged in, allow them to log in 
    if (!user) {
      
    } else {
      // else, give error message: already logged
    }
  });
  // Get the email and password from static page
	var inputs = url.parse(request.url, true).query
	const email = (inputs.email)
	const password = (inputs.password)

  fb.auth().signInWithEmailAndPassword(email, password)
  .then(function()  {
    var user = fb.auth.currentUser
    var databaseRef = firebaseDB.ref()
    var userData = {
      lastLogin : Date.now()
    }
    databaseRef.child('users/' + user.uid).update(userData)
  })
  .catch(function(error) {
    var errorCode = error.code
    var errorMessage = error.message
  })
});

app.get('/createAccount', (request, response) => {
	var inputs = url.parse(request.url, true).query
	const email = (inputs.email)
	const password = (inputs.password)

  fb.auth().createUserWithEmailAndPassword(email, password)
  .then(function() {

    // if creation is successful, check if user is logged in and return user ID.
    fb.auth().onAuthStateChanged((user) => {
      if (user) {
        const email = user.email;
        response.type('text/plain')
        response.send(email) }
    });
  })
  // need to make errors more meaningful, give user feedback.
  .catch(function(error) {
    var errorCode = error.code
    var errorMessage = error.message
  })
});

// Function to check if user is logged in. If they are, return their email.
app.get('/islogged', (request, response) => {
  fb.auth().onAuthStateChanged(function(user) {
    if (user) {
      const email = user.email
      response.type('text/plain')
      return response.send(email)
    } else {
      response.type('text/plain')
      return response.send("NoLog")
    }
  });
});

// this function is broken atm
app.get('/logout', (request, response) => {
  fb.auth().onAuthStateChanged(function(user) {
    if (user) {
      fb.auth().signOut(user)
      response.type('text/plain')
      response.send("out")
    } else {
      response.type('text/plain')
      response.send("noLogOut")
    }
  });
});

// custom 500 page
app.use((err, request, response, next) => {
	console.error(err.message)
	response.type('text/plain')
	response.status(500)
	response.send('500 - Server Error')
})

// listen on the port
app.listen(port, () => console.log(
    `Express started on http://localhost:${port}; ` +
    `press Ctrl-C to terminate.`))