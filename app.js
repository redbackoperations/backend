const express = require('express');
const app = express();
//const passport = require('passport');
const cookieSession = require('express-session');
//require('./passport');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
var name = new String();
var userprofile;
app.use(cookieSession({
    name: 'google-auth-session',
    secret: 'my super secret',
    keys: ['key1', 'key2'],
    resave: false,
saveUninitialized: true,
cookie: { secure: true }
}));
    
    
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user , done) => {
    done(null , user);
})
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID:"718778308430-ki99eu0aa7h8kn52e1n83eojlvebvtkl.apps.googleusercontent.com", // Your Credentials here.
    clientSecret:"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", // Your Credentials here.
    callbackURL:"http://localhost:3000/login/google",
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    name = profile.displayName;
    userprofile = profile;

    return done(null, profile);
  }
));     
  
app.get('/', (req, res) => {
    res.send("<button><a href='/auth'>Login With Google</a></button>")
});
  
// Auth 
app.get('/auth' , passport.authenticate('google', { scope:
    [ 'email', 'profile' ]
}));
  
// Auth Callback
app.get( '/login/google',
    passport.authenticate( 'google', {
        successRedirect: '/auth/callback/success',
        failureRedirect: '/auth/callback/failure',session:true,
}));
  
// Success 
app.get('/auth/callback/success' , (req , res) => {
 // if(!req.user)
   // res.redirect('/auth/callback/failure');
    res.send("Welcome "+name );
    console.log(userprofile);
  
});
  
// failure
app.get('/auth/callback/failure' , (req , res) => {
    res.send("Error");
})
  
app.listen(3000 , () => {
    console.log("Server Running on port 3000");
});