path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const passport = require('passport');
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { querySingleData,updateDB,queryDatabase } = require('./db')
const {jwtOptions} = require('../config/passport-config')
const jwt = require('jsonwebtoken'); 

passport.use(new GoogleStrategy(
    {
        clientID: process.env.client_id,
        clientSecret: process.env.client_secret,
        callbackURL: process.env.redirect_uris,
        passReqToCallback: true
    },
    async (req,_, __, profile, done) => {
        const account = profile._json;
        let user = {};
        let existingUser = true;        
        let call = req.session.redirect
        try {
            const query = `SELECT "UID" FROM "users" WHERE "email" = $1`
            const requirements = [account.email]
            const response = await querySingleData(query, requirements)
           
            if (!response) {
                existingUser = false
            }
            if (existingUser) {               
                    const query = `SELECT "google_id","apple_id" FROM "users" WHERE "email" = $1`
                    const requirements = [account.email]
                    const resp = await querySingleData(query,requirements)
                    if (!resp.google_id) {
                           if (resp.apple_id) {
                            user = {
                                existinguser: existingUser,
                                correctlogin: false,
                                shoulduse:'apple',
                                callb: call
                            }
                           }
                           else {
                            user = {
                                existinguser: existingUser,
                                correctlogin: false,
                                shoulduse:'email',
                                callb: call
                            }
                           }
                    }
                    else {
                        // Correct login method, generate token
                        let payload = {email: account.email};
                        let token = jwt.sign(payload, jwtOptions.secretOrKey);
                        user = {
                            existinguser: existingUser,
                            correctlogin: true,
                            token: token,
                            name:account.name,
                            picture:account.picture,
                            callb: call
                        }   
                    }
                    //'facebook & google id')
                    //resp)            
                //have user                           
            }
            else {  //create user
                const query1 = `INSERT INTO "users" ("First_name","email","google_id") VALUES ($1,$2,$3) RETURNING "UID"`
                const requirements1 = [account.name,account.email,account.sub]
                await queryDatabase(query1, requirements1)   
                let payload = {email: account.email};
                let token = jwt.sign(payload, jwtOptions.secretOrKey);
                user = {
                    existinguser: existingUser,
                    correctlogin: true,
                    token: token,
                    name:account.name,
                    picture:account.picture,
                    callb: call
                } 
            }
            done(null, user)
        }
        catch (error) {
            done(error)
        }
    }
)
);
passport.serializeUser((user, done) => {
    //loads into req.session.passport.user
    done(null, user)
}
)
passport.deserializeUser((user, done) => {
    //loads into req.user
    done(null, user)

})