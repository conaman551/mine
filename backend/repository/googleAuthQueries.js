path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const passport = require('passport');
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { querySingleData,updateDB,queryDatabase } = require('./db')
const {jwtOptions} = require('../config/passport-config')
const jwt = require('jsonwebtoken'); 
const Stripe = require('stripe');
//const stripe = Stripe(process.env.stripeTESTKEY);
const stripe = Stripe(process.env.stripeLIVEKEY)

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
            const query = `SELECT userid FROM users WHERE email=$1`
            const requirements = [account.email]
            const response = await querySingleData(query, requirements)
           
            if (!response) {
                existingUser = false
            }
            if (existingUser) {               
                    const query = `SELECT google_id, facebookid FROM credentials WHERE email = $1`
                    const requirements = [account.email]
                    const resp = await querySingleData(query,requirements)
                    if (!resp.google_id) {
                        if (resp.facebookid) {
                            //redirect user to password login
                            user = {
                                existinguser: existingUser,
                                correctlogin: false,
                                shoulduse:'facebook',
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
                    //'facebook & google id')
                    //resp)            
                //have user                           
            }
            else {  //create user
                const query1 = `INSERT INTO users ("name","email") VALUES ($1,$2) RETURNING userid`
                const requirements1 = [account.name,account.email]
                let resp = await queryDatabase(query1, requirements1)
                //resp) 
                //sign up to stripe
                const customer = await stripe.customers.create({   //creates a stripe customer
                    name: account.name,
                    email: account.email,
                  });
                const query = `INSERT INTO credentials ("email","userid","google_id","stripe_id") VALUES ($1,$2,$3,$4)`
                const requirements = [account.email,resp[0].userid,account.sub,customer.id]
                queryDatabase(query, requirements)
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