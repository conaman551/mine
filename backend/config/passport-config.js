  
  path = require('path')
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const passport = require('passport')
  const JwtStrategy = require('passport-jwt').Strategy;
  const ExtractJwt = require('passport-jwt').ExtractJwt;
  const { getUserByEmail } = require('../repository/userRepo')
  const {  } = require('../services/userServices')


  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.secretkey
  };
  
  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        const user = await getUserByEmail(jwtPayload.email)
        if (!user) {
          return done(null, false)
        }
        return done(null, user)
      } catch (error) {
        return done(error, false)
      }
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user.email);
  })
  
  passport.deserializeUser(async (email, done) => {
   
    try{
      const user = await getUserByEmail(email)
      if(!user){
        return done(null, false)
      }
      return done(null, user)
    } catch (error) {
      return done(error, false);
    }

  })
  module.exports = {passport, jwtOptions}