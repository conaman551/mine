const { queryDatabase } = require('./db')
const bcrypt = require('bcrypt');


async function createUserOld(name, email, password, phonenumber, biography) {
  hashedPassword = await bcrypt.hash(password, 1);
  query = `INSERT INTO "USER" ("name", "email", "password", "phonenumber", "biography") VALUES ($1, $2, $3, $4, $5) RETURNING *`
  requirements = [name, email, hashedPassword, phonenumber, biography]
  const response = await queryDatabase(query, requirements)
  return response
}


//creating the temp user with null values
const createUser = async (email,name) => {
    const reqs = [name,email]
    try {
        const result = await queryDatabase(`INSERT INTO "USER" ("First_name", "email") VALUES ($1, $2) RETURNING *`,reqs)
        console.log('new user',result)
        // Respond with success message
        return result[0]
    } catch (error) {
        // Respond with error message
        console.error(error);
        return null
    }
};


async function deleteUser(UID) {
  let random = generateRandomString(7)
 // let randomnumber = generateNumber()
  let deleted = 'deleted'
  const query = `UPDATE "USER"
    SET email = $2,
    password = $2,
    dob = $3,
    phonenumber = $3,
    biography = $3
    WHERE UID = $1;`
  const requirements = [UID,random,deleted]
  await queryDatabase(query,requirements)
}

//createUser("name", "gmail", "password", "dob", 1532, "biography")
async function createCredentials(email, UID, stripe_id) {
  query = `INSERT INTO credentials("email","UID","stripe_id") VALUES ($1,$2,$3)`
  requirements = [email, UID, stripe_id]
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

async function deleteCredentials(UID) {
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
    WHERE UID = $1;`
  const requirements = [UID,random,randomnumber,deleted]
  await queryDatabase(query,requirements)
}

async function getOauthUserID(email) {
  const query = `SELECT google_id,apple_id,facebookid FROM credentials WHERE email = $1`
  const requirements = [email]
  const resp = await queryDatabase(query, requirements);
  return resp[0];
}

async function addAppleUser(name,email) {
  const query1 = `INSERT INTO "USER" ("name","email") VALUES ($1,$2) RETURNING UID`
  const requirements1 = [name,email]
  let resp = await queryDatabase(query1, requirements1)
  return resp[0].UID
}

async function getAppleEmail(appleid) {
  const query = `SELECT email FROM credentials WHERE apple_id = $1`
  const requirements1 = [appleid]
  const user = await queryDatabase(query,requirements1)
  if (user.length !== 0) {
    return user[0].email;
  } 
  else {
    return null
  }
}

async function addAppleCredentials(email, UID, apple_id, stripe_id) {
  query = `INSERT INTO credentials ("email","UID","apple_id","stripe_id") VALUES ($1,$2,$3,$4)`
  requirements = [email, UID,apple_id, stripe_id]
  await queryDatabase(query, requirements)
  return true
}

async function addFirebaseToken(email, firebase_token) {
  query = `UPDATE credentials SET firebase_token = $2 WHERE email = $1 RETURNING *`
  requirements = [email, firebase_token]
  const response = await queryDatabase(query, requirements)
  return response
}

async function getFirebaseToken(UID) {
  const query = `SELECT firebase_token FROM credentials WHERE UID = ${UID}`
  const user = await queryDatabase(query)
  return user[0];
}


async function getUserByUserId(UID) {
  const query = `SELECT * FROM "USER" WHERE UID = ${UID}`
  const user = await queryDatabase(query)
  return user[0];
}

async function getAllUsers() {
  const query = `SELECT * FROM "USER"`
  const user = await queryDatabase(query)
  return user;
}

async function getUserByDriverId(driverId) {
  const query = `SELECT * FROM "USER" WHERE driverid = ${driverId}`
  const user = await queryDatabase(query)
  return user[0];
}

async function getUserByEmail(email) {
  const query = `SELECT * FROM "USER" WHERE "email" = $1`;
  const values = [email];
  const result = await queryDatabase(query, values);
  return result[0];
}

async function updateEmail(UID, email) {
  query = `UPDATE "USER" SET email = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, email]
  const response = await queryDatabase(query, requirements)
  return response
}

async function addProfileImage(UID, image) {
  query = `UPDATE "USER" SET profile_image = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, image]
  const response = await queryDatabase(query, requirements)
  return response
}

async function addCarImage(UID, image) {
  query = `UPDATE "USER" SET car_image = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, image]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateRating(UID,averagerating) {
 let query = `UPDATE "USER" SET averagerating = $2 WHERE UID = $1 RETURNING *`
  let requirements = [UID,averagerating]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateBiography(UID, biography) {
  query = `UPDATE "USER" SET biography = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, biography]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePassword(UID, password) {
  query = `UPDATE "USER" SET password = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, password]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePhonenumber(UID, phonenumber) {
  query = `UPDATE "USER" SET phonenumber = $2 WHERE UID = $1 RETURNING *`
  requirements = [UID, phonenumber]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updatePasswordByEmail(email, password) {
  query = `UPDATE "USER" SET password = $2 WHERE email = $1 RETURNING *`
  requirements = [email, password]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateUserDetailsByEmail(email, name, phoneNumber) {
  query = `UPDATE "USER" SET name = $2, phonenumber = $3 WHERE email = $1 RETURNING *`
  requirements = [email, name, phoneNumber]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateBiographyByEmail(email, biography) {
  query = `UPDATE "USER" SET biography = $2 WHERE email = $1 RETURNING *`
  requirements = [email, biography]
  const response = await queryDatabase(query, requirements)
  return response
}

async function getCompletedRides(UID) {
  query = `SELECT r.*
  FROM ride r
  JOIN ridebooking rb ON r.rideid = rb.rideid
  WHERE rb.UID = ${UID}
  AND r.status = 'completed'
  AND rb.requeststatus = 'accepted'`
  const response = await queryDatabase(query)
  return response
}

async function updateRidesCompletedByUserId(UID) {
  query = `UPDATE "USER" SET ridescompleted = ridescompleted + 1 WHERE UID = $1`
  requirements = [UID]
  const response = await queryDatabase(query, requirements)
  return response
}

async function creditUserAccount(UID, amount) {
  query = `UPDATE "USER" SET passengercredit = passengercredit + $2 WHERE UID = $1`
  requirements = [UID, amount]
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