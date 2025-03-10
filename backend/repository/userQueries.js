const { queryDatabase, querySingleData } = require('./db')
const bcrypt = require('bcrypt');


async function createUser(name, email, password, phonenumber, biography) {
  hashedPassword = await bcrypt.hash(password, 1);
  query = `INSERT INTO users ("name", "email", "password", "phonenumber", "biography") VALUES ($1, $2, $3, $4, $5) RETURNING *`
  requirements = [name, email, hashedPassword, phonenumber, biography]
  const response = await queryDatabase(query, requirements)
  return response
}
async function deleteUser(userid) {
  let random = generateRandomString(7)
 // let randomnumber = generateNumber()
  let deleted = 'deleted'
  const query = `UPDATE users
    SET email = $2,
    password = $2,
    dob = $3,
    phonenumber = $3,
    biography = $3
    WHERE userid = $1;`
  const requirements = [userid,random,deleted]
  await queryDatabase(query,requirements)
}

//createUser("name", "gmail", "password", "dob", 1532, "biography")
async function createCredentials(email, userid, stripe_id) {
  query = `INSERT INTO credentials("email","userid","stripe_id") VALUES ($1,$2,$3)`
  requirements = [email, userid, stripe_id]
  const response = await queryDatabase(query, requirements)
  return response
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateNumber() {
  return Math.floor(10000000 + Math.random() * 90000000);
}

async function deleteCredentials(userid) {
  let random = generateRandomString(7)
  let randomnumber = generateNumber()
  let deleted = 'deleted'
  const query = `UPDATE credentials
    SET email = $2,
    google_id = $4,
    apple_id = $4,
    facebookid = $3,
    access_token = $4,
    bank_account = $4,
    stripe_id = $4,
    firebase_token = $4,
    paypal_account = $4
    WHERE userid = $1;`
  const requirements = [userid,random,randomnumber,deleted]
  await queryDatabase(query,requirements)
}

async function getOauthUserID(email) {
  const query = `SELECT google_id,apple_id,facebookid FROM credentials WHERE email = $1`
  const requirements = [email]
  const resp = await querySingleData(query, requirements)
  return resp
}

async function addAppleUser(name,email) {
  const query1 = `INSERT INTO users ("name","email") VALUES ($1,$2) RETURNING userid`
  const requirements1 = [name,email]
  let resp = await queryDatabase(query1, requirements1)
  return resp[0].userid
}

async function getAppleEmail(appleid) {
  const query = `SELECT email FROM credentials WHERE apple_id = $1`
  const requirements1 = [appleid]
  const users = await queryDatabase(query,requirements1)
  if (users.length !== 0) {
    return users[0].email;
  } 
  else {
    return null
  }
}

async function addAppleCredentials(email, userid, apple_id, stripe_id) {
  query = `INSERT INTO credentials ("email","userid","apple_id","stripe_id") VALUES ($1,$2,$3,$4)`
  requirements = [email, userid,apple_id, stripe_id]
  await queryDatabase(query, requirements)
  return true
}

async function addFirebaseToken(email, firebase_token) {
  query = `UPDATE credentials SET firebase_token = $2 WHERE email = $1 RETURNING *`
  requirements = [email, firebase_token]
  const response = await queryDatabase(query, requirements)
  return response
}

async function getFirebaseToken(userid) {
  const query = `SELECT firebase_token FROM credentials WHERE userid = ${userid}`
  const users = await queryDatabase(query)
  return users[0];
}


async function getUserByUserId(userId) {
  const query = `SELECT * FROM users WHERE userid = ${userId}`
  const users = await queryDatabase(query)
  return users[0];
}

async function getAllUsers() {
  const query = `SELECT * FROM users`
  const users = await queryDatabase(query)
  return users;
}

async function getUserByDriverId(driverId) {
  const query = `SELECT * FROM users WHERE driverid = ${driverId}`
  const user = await queryDatabase(query)
  return user[0];
}

async function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = '${email}'`
  const user = await queryDatabase(query)
  return user[0];
}

async function updateEmail(userId, email) {
  query = `UPDATE users SET email = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, email]
  const response = await queryDatabase(query, requirements)
  return response
}

async function addProfileImage(userId, image) {
  query = `UPDATE users SET profile_image = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, image]
  const response = await queryDatabase(query, requirements)
  return response
}

async function addCarImage(userId, image) {
  query = `UPDATE users SET car_image = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, image]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateRating(userid,averagerating) {
 let query = `UPDATE users SET averagerating = $2 WHERE userid = $1 RETURNING *`
  let requirements = [userid,averagerating]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateBiography(userId, biography) {
  query = `UPDATE users SET biography = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, biography]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePassword(userId, password) {
  query = `UPDATE users SET password = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, password]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePhonenumber(userId, phonenumber) {
  query = `UPDATE users SET phonenumber = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, phonenumber]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePasswordByEmail(email, password) {
  query = `UPDATE users SET password = $2 WHERE email = $1 RETURNING *`
  requirements = [email, password]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateUserDetailsByEmail(email, name, phoneNumber) {
  query = `UPDATE users SET name = $2, phonenumber = $3 WHERE email = $1 RETURNING *`
  requirements = [email, name, phoneNumber]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateBiographyByEmail(email, biography) {
  query = `UPDATE users SET biography = $2 WHERE email = $1 RETURNING *`
  requirements = [email, biography]
  const response = await queryDatabase(query, requirements)
  return response
}

async function getCompletedRides(userId) {
  query = `SELECT r.*
  FROM ride r
  JOIN ridebooking rb ON r.rideid = rb.rideid
  WHERE rb.userid = ${userId}
  AND r.status = 'completed'
  AND rb.requeststatus = 'accepted'`
  const response = await queryDatabase(query)
  return response
}

async function updateRidesCompletedByUserId(userId) {
  query = `UPDATE users SET ridescompleted = ridescompleted + 1 WHERE userid = $1`
  requirements = [userId]
  const response = await queryDatabase(query, requirements)
  return response
}

async function creditUserAccount(userId, amount) {
  query = `UPDATE users SET passengercredit = passengercredit + $2 WHERE userid = $1`
  requirements = [userId, amount]
  const response = await queryDatabase(query, requirements)
  return response
}

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  addAppleUser,
  addAppleCredentials,
  getAppleEmail,
  createCredentials,
  deleteCredentials,
  getOauthUserID,
  getUserByUserId,
  getUserByDriverId,
  getCompletedRides,
  getUserByEmail,
  updateEmail,
  updateBiography,
  updatePassword,
  updatePhonenumber,
  updatePasswordByEmail,
  updateUserDetailsByEmail,
  updateBiographyByEmail,
  updateRidesCompletedByUserId,
  updateRating,
  creditUserAccount,
  addFirebaseToken,
  getFirebaseToken,
  addProfileImage,
  addCarImage
}