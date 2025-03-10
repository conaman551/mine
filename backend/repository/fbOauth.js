path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const passport = require('passport');
const { Strategy: FacebookStrategy } = require("passport-facebook");
const { querySingleData, updateDB,queryDatabase } = require('./db')
const {jwtOptions} = require('../config/passport-config')
const jwt = require('jsonwebtoken'); 
const Stripe = require('stripe');
//const stripe = Stripe(process.env.stripeTESTKEY);
const stripe = Stripe(process.env.stripeLIVEKEY)

passport.use(new FacebookStrategy(
    {
        clientID: process.env.facebook_app_id,
        clientSecret: process.env.fb_secret,
        callbackURL: "https://trippr.org:3001/auth/facebook/callback",
        passReqToCallback: true,
        profileFields: ['id', 'displayName', 'email']
    },
    async (req,_, __, profile, done) => {
        const account = profile._json;
        let user = {};
        let existingUser = true;        
        let call = req.session.redirect
        try {
            const query = `SELECT userid FROM users WHERE email=$1`
            const requirements = [account.email]
            const response = await querySingleData(query, requirements)
            if (!response) {
                existingUser = false
            }
            if (existingUser) {
                //have user
                const query = `SELECT google_id,apple_id,facebookid FROM credentials WHERE email = $1`
                    const requirements = [account.email]
                    const resp = await querySingleData(query,requirements)
                    if (!resp.facebookid) {
                        if (resp.google_id) {
                            //redirect user to password login
                            user = {
                                existinguser: existingUser,
                                correctlogin: false,
                                shoulduse:'google',
                                callb: call
                            }
                        }
                        else if (resp.apple_id) {
                            //redirect user to facebook login
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
                                shoulduse:'password',
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
            }
            else {
                const query1 = `INSERT INTO users ("name","email") VALUES ($1,$2) RETURNING userid`
                const requirements1 = [account.name,account.email]
                let resp = await queryDatabase(query1, requirements1)
                //resp) 
                //sign up to stripe
                const customer = await stripe.customers.create({   //creates a stripe customer
                    name: account.name,
                    email: account.email,
                  });
                const query = `INSERT INTO credentials ("email","userid","facebookid","stripe_id") VALUES ($1,$2,$3,$4)`
                const requirements = [account.email,resp[0].userid,account.id,customer.id]
                await queryDatabase(query, requirements)
                // //"added new google user to db")
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
                
                //create user
            }
            // //user)
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