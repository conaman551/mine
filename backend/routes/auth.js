
const express = require("express");
const authRouter = express.Router();
const jwt = require('jsonwebtoken'); 
const { passport, jwtOptions } = require('../config/passport-config')
const { getUserByEmail, getUserByUserId,addFirebaseToken,createCredentials, updatePasswordByEmail, getOauthUserID, addAppleUser, addAppleCredentials, getAppleEmail } = require('../repository/userRepo')
const { validatePassword, generateUser, validEmail } = require('../services/userServices')
// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
//const Stripe = require('stripe');
//const stripe = Stripe(process.env.stripeTESTKEY);
const bcrypt = require("bcrypt");
//const stripe = Stripe(process.env.stripeLIVEKEY)

const nodemailer = require('nodemailer');
const { getVersion } = require("../repository/adminQueries");
const { createUser } = require("../repository/userRepo");
let sentCodes = {}

// Configure Nodemailer to use an email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'admin@trippr.org',
    pass: 'bzgu cqmh uhwi ynrv'
  }
});

authRouter.use(express.json())

// Login takes email and password and checks if its valid and secure
authRouter.post("/login", async (req, res) => {
  // Requires {email: '', password: ''}
  if(!(req.body.email && req.body.password)){
    return res.status(400).json({message:"Malformed Request", messageType:"JSONError"})
  }
  let email = req.body.email.toLowerCase();
  let password = req.body.password;
  if(!validEmail(email)) {
    return res.status(400).json({message:"Please enter your Email", messageType:"InputError"});
  }
  let oauthid = await getOauthUserID(email)
  //Prevents user from attempting email login with google / fb email address
  if (oauthid) {
  if (oauthid.google_id) {
    return  res.status(400).json({message:"google user", messageType:"user error"});
  }
  if (oauthid.facebookid) {
    return  res.status(400).json({message:"facebook user", messageType:"user error"});
  }
  if (oauthid.apple_id) {
    return  res.status(400).json({message:"apple user", messageType:"user error"});
  }
  }
  
  if (password.length < 8 || password.length > 50)  {
    return res.status(400).json({message:"Malformed Request", messageType:"JSONError"})
  }
    
  //Prevents brute force attacks
  setTimeout(()=>{
    getUserByEmail(email).then((user) => {
      if(!user){
        return res.status(201).json({message:"incorrect", messageType:"InputError"});
      }
  
      validatePassword(password, user.password).then((passwordsMatching) => {
        if(passwordsMatching)
        {
          passport.authenticate('local'), 
          { 
            session: true 
          }
          let payload = {email: user.email};
          let token = jwt.sign(payload, jwtOptions.secretOrKey);
          res.json({message: "Valid Login", token: token, messageType:"Accepted"});
        } else {
          res.status(201).json({message:"incorrect", messageType:"InputError"});
        }
      })
    })
  },1000)

 
});

authRouter.post("/register", async (req, res) => {
  // Checking all fields
  if(!(req.body.name && req.body.email && req.body.password && req.body.phonenumber && req.body.identify)){  //Identify is to ensure this request comes from our app
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
  if (req.body.identify !== 'L5dT3R5zdbCWqB9yabuwjWz7goEFHhXSvutvw2EoFozsD9Zn7oa') {
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"}); 
  }
  let email = req.body.email.toLowerCase()
  // Check if user exists
  const userExists = await getUserByEmail(email)
  if( userExists ){
     return res.status(400).json({message:"Email already in use", messageType:"InputError"});
  }
 
  // Creating user
  const {iserror, response} = await generateUser(req.body.name, email, req.body.password, req.body.phonenumber)
  if(iserror) {
    return res.status(400).json({message:response, messageType:"InputError"})
  }
  let user = await getUserByEmail(email)
  const customer = {id:1};/*await stripe.customers.create({   //creates a stripe customer
    name: req.body.name,
    email: email,
  }); */
 // //user)
createCredentials(email,user.userid,customer.id)  //saves their stripe id
return res.status(201).json({message:response, messageType:"Accepted"})
})

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

authRouter.post('/requestVerification', async(req, res) => {
  if(!(req.body.email)){
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
  const email = req.body.email.toLowerCase();
 /* let oauthid = await getOauthUserID(email)
  if (oauthid) {
  if (oauthid.google_id) {
    return  res.status(201).json({message:"google user", messageType:"user error"});
  }
  if (oauthid.facebookid) {
    return  res.status(201).json({message:"facebook user", messageType:"user error"});
  }
  if (oauthid.apple_id) {
    return  res.status(201).json({message:"apple user", messageType:"user error"});
  }
} */
  const randomString = Math.floor(10000 + Math.random() * 90000); // Generate a 5 digit random number
 // const randomString = generateRandomString(6);
  //randomString); // Example output: 'aB3dE6f'
  sentCodes[email] = randomString
  let threeMin = 1000*60*5
  setTimeout(()=>{
    delete sentCodes[email]
  },threeMin)
  // Send verification email
  const mailOptions = {
    from: 'trippr.general@gmail.com',
    to: email,
    subject: 'Mine Login Code',
    text: `Your login code is: ${randomString}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      //error);
      return res.status(400).json({message:error, messageType:"email error"})
    } else {
      //'Email sent: ' + info.response);
      return res.status(201).json({message:'email sent', messageType:"Accepted"})
    }
  });
});

authRouter.post('/emailVerify', async(req,res) => {
  if(!(req.body.code && req.body.email)){
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
/*  if (isNaN(req.body.code)) {
    return res.status(400).json({message:'code is not a number', messageType:"InputError"})
  }*/
  const email = req.body.email.toLowerCase();
  let existingUser = false;
  let UID;
  const user = await getUserByEmail(email);
  if (user) {
    existingUser = true;
    UID = user.UID;
  }
  else {
    //Create User
   let newuser = await createUser(email,'new user')
   UID = newuser.UID;
  }
  const code = req.body.code;
  setTimeout(()=>{
  if (sentCodes[email]) {
  if (Number(sentCodes[email]) == Number(code)) { 
   // //`${sentCodes[email]} == ${code}`,'Javascript is cooked')
    delete sentCodes[email]
    let payload = {email: email};
    let token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "correct", token: token, existingUser:existingUser,UID:UID, messageType:"Accepted"});
  }
  else {
    return res.status(201).json({message:'wrong code', messageType:"Accepted"})
  }
  }
  else {
    return res.status(201).json({message:'timed out', messageType:"Accepted"})
  }
  },500)
})

authRouter.post('/newPasswordVerify', async (req, res) => {
  //req.body)
  if(!(req.body.code && req.body.email && req.body.password)){
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
  const email = req.body.email.toLowerCase();
  let user = await getUserByEmail(email)
  if (!user) {
    return  res.status(400).json({message:"User does not exist", messageType:"user error"});
  }
  
  let oauthid = await getOauthUserID(email)
  if (oauthid) {
  if (oauthid.google_id) {
    return  res.status(400).json({message:"google user", messageType:"user error"});
  }
  if (oauthid.facebookid) {
    return  res.status(400).json({message:"facebook user", messageType:"user error"});
  }
  if (oauthid.apple_id) {
    return  res.status(400).json({message:"apple user", messageType:"user error"});
  }
}

  //Check if email associated with google or facebook
  let hashedPassword = await bcrypt.hash(req.body.password,1);
  
  const code = req.body.code;
  setTimeout(()=> {
  if (sentCodes[email]) {
  if (sentCodes[email] === code) {
   // //`${sentCodes[email]} == ${code}`,'Javascript is cooked')
    updatePasswordByEmail(email, hashedPassword)
    delete sentCodes[email]
    return res.status(201).json({message:'correct', messageType:"Accepted"})
  }
  else {
    return res.status(201).json({message:'wrong code', messageType:"Accepted"})
  }
  }
  else {
    return res.status(201).json({message:'timed out', messageType:"Accepted"})
  }
},500)
})

//Developer Conal, adding google Oauth stuff below
authRouter.get("/google", function(req, res, next) {
  req.session.redirect = req.query.redirect;
 // //req.query.redirect)
  next()
  },
  passport.authenticate("google", {
    scope:[ 'email', 'profile' ]   
  })
)

authRouter.get("/google/callback", 
    passport.authenticate("google", {
    session: true
  }),
  function (req, res) {
    if (req.user.correctlogin) {
      res.send(`<script>window.location.replace("${req.user.callb}?existingUser=${req.user.existinguser}&name=${req.user.name}&token=${req.user.token}&correctlogin=${req.user.correctlogin}")</script>`)
    }
    else {
      res.send(`<script>window.location.replace("${req.user.callb}?existingUser=${req.user.existinguser}&correctlogin=${req.user.correctlogin}&shoulduse=${req.user.shoulduse}")</script>`)
    }
    delete req.session.redirect;
});

//Facebook Oauth stuff below
authRouter.get("/facebook", function(req, res, next) {
  req.session.redirect = req.query.redirect;
 // //req.query.redirect)
  next()
},
  passport.authenticate("facebook", {
    scope: ['public_profile','email']
       
  })
)
authRouter.get("/facebook/callback", 
  passport.authenticate("facebook", {
  session: true
}),
function (req, res) {
  if (req.user.correctlogin) {
    res.send(`<script>window.location.replace("${req.user.callb}?existingUser=${req.user.existinguser}&name=${req.user.name}&token=${req.user.token}&correctlogin=${req.user.correctlogin}&picture=${req.user.picture}")</script>`)
  }
  else {
    res.send(`<script>window.location.replace("${req.user.callb}?existingUser=${req.user.existinguser}&correctlogin=${req.user.correctlogin}&shoulduse=${req.user.shoulduse}")</script>`)
  }
  delete req.session.redirect;
});


authRouter.post("/registerPushToken",passport.authenticate('jwt', { session: false }), async (req, res) => {
  //req.body.token)
  if (!req.body.token) {
    return res.status(400).json({message:"No token provided", messageType:"Denied"});
  }
 await addFirebaseToken(req.user.email,req.body.token)
 return res.status(200).json({message:"tokenAdded", messageType:"Accepted"})
})

authRouter.post("/appleRegister", async (req, res) => {
  // Checking all fields
  if(!(req.body.name && req.body.email && req.body.appleid)){  //Identify is to ensure this request comes from our app
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
  let email = req.body.email.toLowerCase()
  // Check if user exists
  const userExists = await getUserByEmail(email)
  if(userExists){
     let email = await getAppleEmail(req.body.appleid)
     if (email) {
      let payload = {email:email};
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      return res.status(201).json({message:{ok:true,token:token,existinguser:true}, messageType:"Accepted"})
     }
     else {
      let others = await getOauthUserID(email)
      if (others.google_id){
        return res.status(201).json({message:{ok:true,shoulduse:'google',existinguser:true}, messageType:"Accepted"})
      }
      else if (others.facebookid){
        return res.status(201).json({message:{ok:true,shoulduse:'facebook',existinguser:true}, messageType:"Accepted"})
      }
      else {
        return res.status(201).json({message:{ok:true,shoulduse:'email',existinguser:true}, messageType:"Accepted"})
      }
     }
    
  }
  else {
  let userid = await addAppleUser(req.body.name,req.body.email)
  const customer = {id:1}; /*await stripe.customers.create({   //creates a stripe customer
    name:req.body.name,
    email:req.body.email
  });*/
  let apple = await addAppleCredentials(req.body.email,userid,req.body.appleid,customer.id)
  let payload = {email:req.body.email};
  let token = jwt.sign(payload, jwtOptions.secretOrKey);
  return res.status(201).json({message:{ok:apple,token:token,existinguser:false}, messageType:"Accepted"})
  }
})

authRouter.post("/applesignin", async (req, res) => {
  // Checking all fields
  if(!req.body.appleid){  //Identify is to ensure this request comes from our app
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
  let email = await getAppleEmail(req.body.appleid)
  if (email) {
    let payload = {email:email};
    let token = jwt.sign(payload, jwtOptions.secretOrKey);
    return res.status(201).json({message:{ok:true,token:token,existinguser:true}, messageType:"Accepted"})
  }
  else {
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
  }
})



authRouter.get("/getMyID", passport.authenticate('jwt', { session: false }), async (req, res) => {

  let currUser = await getUserByEmail(req.user.email)
  if (!currUser) {
    return  res.status(400).json({message:"User does not exist", messageType:"user error"});
  }

  return res.status(200).json({message:currUser.userid, messageType:"Accepted"});
})

authRouter.get("/getVersion", async (req, res) => {

  const vers = await getVersion() // temp out while init home server
  //let vers = '1.1.6' ;

  return res.status(200).json({message:vers, messageType:"Accepted"});
})


authRouter.get("/getNameByUserID/:userid", passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(!(req.params.userid)){
    return  res.status(400).json({message:"Malformed Request", messageType:"ParamError"});
  }
  let currUser = await getUserByUserId(req.params.userid)
  if (!currUser) {
    return  res.status(400).json({message:"User does not exist", messageType:"user error"});
  }
  return res.status(200).json({message:currUser.name, messageType:"Accepted"});
})


  module.exports = authRouter;
