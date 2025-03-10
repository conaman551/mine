const { query } = require('express');
const { queryDatabase } = require('./db')
const bcrypt = require('bcrypt');

//Pen testing 
//Dev Michael
async function penetrateMe(input) {
  const type = 2;
  let response = "Wrong Type"
  console.log("Input: ", input)
  //Type 1
  if (type == 1) {
    const query = `SELECT * FROM users WHERE userid = $1`
    requirements = [input]
    response = await queryDatabase(query, requirements)
  }
  //Type 2
  if (type == 2) {
    const query = `SELECT * FROM users WHERE userid = ${input}`
    response = await queryDatabase(query)
  }

  return response
}

async function getUsers() {
  const query = 'SELECT * FROM users ORDER BY userid ASC'
  const users = await queryDatabase(query)
  return users;
}

async function getVersion() {
  const query = 'SELECT name FROM users WHERE userid = 1'
  const users = await queryDatabase(query)
  return users[0].name;
}

async function setVersion(vers) {
  
  const query = `UPDATE users SET name = $1 WHERE userid = 1`
  const reqs = [vers]
  queryDatabase(query,reqs)
  return true;
}


async function getAllUserIDs() {
  const query = 'SELECT userid FROM users ORDER BY userid ASC'
  const users = await queryDatabase(query)
  return users;
}

async function getSessions() {
  const query = 'SELECT * FROM session'
  const users = await queryDatabase(query)
  return users;
}

async function getUsersCount() {
  const query = 'SELECT COUNT(*) FROM users'
  const count = await queryDatabase(query)
  return count[0];
}

async function getDriverCount() {
  const query = 'SELECT COUNT(*) FROM driver'
  const count = await queryDatabase(query)
  return count[0];
}
//SELECT COUNT(*) FROM your_table_name;

async function pauseAccount(userId, reason) {
  const query = `UPDATE users SET pausedreason = $2 WHERE userid = $1 RETURNING *`
  requirements = [userId, reason]
  const response = await queryDatabase(query, requirements)
  return response
}

async function resumeAccount(userId) {
 const query = `UPDATE users SET pausedreason = null WHERE userid = $1 RETURNING *`
  requirements = [userId]
  const response = await queryDatabase(query, requirements)
  return response
}

async function createblacklist(userId, email, payoutmethod, destination_account) {
 const query = `INSERT INTO blacklist ("userid","email","payoutmethod","destination_account") VALUES ($1,$2,$3,$4)`
  requirements = [userId, email, payoutmethod, destination_account]
  queryDatabase(query, requirements)
}

async function updateUserBlacklist(userid) {
  const query = `UPDATE users SET isblacklisted = true WHERE userid = $1`
  requirements = [userid]
  queryDatabase(query,requirements)
}

async function createAccountsEntry(date,total_payouts,total_refunds,akahu_booked_count,stripe_booked_count,paypal_transferred) {
const query = `INSERT INTO accounts("date","total_payouts","total_refunds","akahu_booked_count","stripe_booked_count","paypal_transferred") VALUES ($1,$2,$3,$4,$5,$6)`
   requirements = [date,total_payouts,total_refunds,akahu_booked_count,stripe_booked_count,paypal_transferred]
   queryDatabase(query, requirements)
}

async function getTotalWithdrawn() {
  const query = `SELECT SUM(amount) FROM payout WHERE payoutmethod = 'akahu' AND refunded = false AND paid = true`
    const count = await queryDatabase(query)
    return count[0];
  }


async function getPaypalPayoutTotal() {
const query = `SELECT SUM(amount) FROM payout WHERE payoutmethod = 'paypal' AND refunded = false`
  const count = await queryDatabase(query)
  return count[0];
}

async function getAkahuPayoutTotal() {
const query = `SELECT SUM(amount) FROM payout WHERE payoutmethod = 'akahu'`
  const count = await queryDatabase(query)
  return count[0];
}

async function getLatestAccounts() {// Gets the most recent account entry
  const query = `SELECT * FROM accounts ORDER BY date DESC LIMIT 1`
  const count = await queryDatabase(query)
  return count[0];
}

async function updatePaypalTransferred(entryid,net){
  const query = `UPDATE accounts SET paypal_transferred += ${net} WHERE entryid = ${entryid}`
  queryDatabase(query)
}

async function getTotalPayouts() {
const query = `SELECT SUM(amount) FROM payout WHERE refunded = false AND credited = true`
  const count = await queryDatabase(query)
  return count[0];
}

async function getTotalRefunds() {
const query = `SELECT SUM(amount) FROM payout WHERE refunded = true`
  const count = await queryDatabase(query)
  return count[0];
}

async function getAkahuBookedCount() {
const query = `SELECT COUNT(*) FROM ridebooking WHERE paymenttype = 'akahu'`
  const count = await queryDatabase(query)
  return count[0];
}

async function getStripeBookedCount() {
const query = `SELECT COUNT(*) FROM ridebooking WHERE paymenttype IN ('stripe','stripesave')`
  const count = await queryDatabase(query)
  return count[0];
}



module.exports = {
  getUsers,
  getVersion,
  setVersion,
  pauseAccount,
  resumeAccount,
  getDriverCount,
  getUsersCount,
  createblacklist,
  updateUserBlacklist,
  getPaypalPayoutTotal,
  getTotalWithdrawn,
  getAkahuPayoutTotal,
  createAccountsEntry,
  getLatestAccounts,
  updatePaypalTransferred,
  getTotalPayouts,
  getTotalRefunds,
  getAkahuBookedCount,
  getStripeBookedCount,
  getAllUserIDs,
  getSessions,
  penetrateMe
}