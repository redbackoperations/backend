const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
  
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
    return done(null, profile);
  }
));