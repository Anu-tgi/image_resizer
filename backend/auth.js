const passport = require("passport");
const TwitterStrategy = require("passport-twitter-oauth2").Strategy;
require("dotenv").config();

passport.use(
  new TwitterStrategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
      scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    },
    (token, tokenSecret, profile, done) => {
      return done(null, { profile, token, tokenSecret });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
