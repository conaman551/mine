//const { query } = require('express')
const { querySingleData,queryDatabase, updateDB } = require('./db')
//addAkahuToken
async function addAkahuToken(access_token, email) {
    const query = `UPDATE credentials SET access_token = $1 WHERE email = $2`
    const requirements = [access_token, email]
    updateDB(query, requirements)
}

async function getAkahuToken(email) {
    const query = `SELECT access_token FROM credentials WHERE email = $1`
    const requirements = [email]
    const resp = await querySingleData(query, requirements)
    return resp.access_token;
}
async function addAkahuHook(webhook_id, email) {
    const query = `UPDATE credentials SET akahu_webhook_id = $1 WHERE email = $2`
    const requirements = [webhook_id, email]
    updateDB(query, requirements)
}

async function getAkahuHook(email) {
    const query = `SELECT akahu_webhook_id FROM credentials WHERE email = $1`
    const requirements = [email]
    const resp = await querySingleData(query, requirements)
    return resp.akahu_webhook_id;
}

async function getAkahuTokenByUserID(userid) {
    const query = `SELECT access_token FROM credentials WHERE userid = $1`
    const requirements = [userid]
    const resp = await querySingleData(query, requirements)
    return resp.access_token;
}

async function deleteAkahuToken(email) {
    const query = `UPDATE credentials SET access_token = null where email = $1`
    const requirements = [email]
    updateDB(query, requirements)
}

async function addBankAccount(bank_account, userid) {
    const query = `UPDATE credentials SET bank_account = $1 WHERE userid = $2`
    const requirements = [bank_account, userid]
    updateDB(query, requirements)
}

async function addAkahuId(akahu_id, userid) {
    const query = `UPDATE credentials SET akahu_id = $1 WHERE userid = $2`
    const requirements = [akahu_id, userid]
    updateDB(query, requirements)
}

async function getAkahuId(email) {
    const query = `SELECT akahu_id FROM credentials WHERE email = $1`
    const requirements = [email]
    const resp = await querySingleData(query, requirements)
    return resp.akahu_id;
}

async function getPaypalEmail(email) {
  const query = `SELECT paypal_account FROM credentials WHERE email = $1`
  const requirements = [email]
  const resp = await querySingleData(query, requirements)
  return resp.paypal_account;
}

async function updatePaypal(newpaypal, userid) {
  const query = `UPDATE credentials SET paypal_account = $1 WHERE userid = $2`
  const requirements = [newpaypal, userid]
  await updateDB(query, requirements)
  return true
}

async function updateBankacc(newbankacc, userid) {
  const query = `UPDATE credentials SET bank_account = $1 WHERE userid = $2`
  const requirements = [newbankacc, userid]
  await updateDB(query, requirements)
  return true
}

async function getAkahuIdByUserID(userid) {
    const query = `SELECT akahu_id FROM credentials WHERE userid = $1`
    const requirements = [userid]
    const resp = await querySingleData(query, requirements)
    return resp.akahu_id;
}

async function deleteAkahuId(email) {
    const query = `UPDATE credentials SET akahu_id = null where email = $1`
    const requirements = [email]
    updateDB(query, requirements)
}

async function getStripeId(email) {
    const query = `SELECT stripe_id FROM credentials WHERE email = $1`
    const requirements = [email]
    const resp = await querySingleData(query, requirements)
    if (resp && resp.stripe_id !== undefined) {
      return resp.stripe_id;
    }
    else {
      return null
    }
}

async function getStripeIdByUserID(userid) {
    const query = `SELECT stripe_id FROM credentials WHERE userid = $1`
    const requirements = [userid]
    const resp = await querySingleData(query, requirements)
    if (resp && resp.stripe_id !== undefined) {
    return resp.stripe_id;
  }
  else {
    return null
  }
}


async function getBankAccount(email) {
    const query = `SELECT bank_account FROM credentials WHERE email = $1`
    const requirements = [email]
    const resp = await querySingleData(query, requirements)
    return resp.bank_account;
}

async function getBankAccountByUserID(userid) {
    const query = `SELECT bank_account FROM credentials WHERE userid = $1`
    const requirements = [userid]
    const resp = await querySingleData(query, requirements)
    return resp.bank_account;
}

async function createPayout(passengerid,driverid,rideid,starttime,amount) {
    const query = `INSERT INTO payout (passengerid,driverid,rideid,starttime,amount) VALUES ($1,$2,$3,$4,$5) RETURNING *`
    const requirements = [passengerid,driverid,rideid,starttime,amount]
    const response = await queryDatabase(query, requirements)
    return response;
  }
// This replaces old system of getting recently completed rides
async function getValidPayouts() {
    let past = 1000 * 60 * 60 * 12 // Passenger has 12 hours - 24hours to dispute (temp set to one hour)
    let recent = Date.now() - past
    const query = `SELECT * FROM payout WHERE starttime < ${recent} AND disputed = false AND paid = false AND refunded = false AND credited = false`
    const payouts = await queryDatabase(query)
    return payouts
}

async function getPayout(rideid,userid) {
     const query = `SELECT * FROM payout WHERE rideid = $1 AND passengerid = $2`
     requirements =  [rideid,userid]
     const response = await queryDatabase(query, requirements)
     return response[0]
}

async function getPayoutsByDriverid(driverid) {
  const query = `SELECT * FROM payout WHERE driverid = $1 AND disputed = false AND paid = false AND refunded = false AND credited = true`
  requirements =  [driverid]
  const response = await queryDatabase(query, requirements)
  return response
}

async function setPayoutPaid(payoutid,payoutmethod) {
    const query = `UPDATE payout SET paid = true, payoutmethod = $2 WHERE payoutid = $1`
    requirements =  [payoutid,payoutmethod]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function setPayoutRefunded(rideid,userid) {
    const query = `UPDATE payout SET refunded = true WHERE rideid = $1 AND passengerid = $2`
    requirements =  [rideid,userid]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function setPayoutDisputed(rideid,userid) {
    const query = `UPDATE payout SET disputed = true WHERE rideid = $1 AND passengerid = $2`
    requirements =  [rideid,userid]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function setPayoutUndisputed(rideid,userid) {
    const query = `UPDATE payout SET disputed = false WHERE rideid = $1 AND passengerid = $2`
    requirements =  [rideid,userid]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function setPayoutCredited(payoutid) {
    const query = `UPDATE payout SET credited = true WHERE payoutid = $1`
    requirements =  [payoutid]
    const response = await queryDatabase(query, requirements)
    return response
  }

async function creditDriver(driverid,amount) {
    const query = `UPDATE driver SET credit = credit + $2 WHERE driverid = $1`
    requirements =  [driverid, amount]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function zeroCredit(driverid) {
    const query = `UPDATE driver SET credit = '0' WHERE driverid = $1`
    requirements =  [driverid]
    const response = await queryDatabase(query, requirements)
    return response
  }
   
  async function getDriversByRequestedPayout() {
    const query = `SELECT * from driver WHERE payoutrequested = true`
    const resp = await queryDatabase(query)
    return resp
  }

  async function payoutrequested(driverid,bool) {
    const query = `UPDATE driver SET payoutrequested = $2 WHERE driverid = $1`
    requirements =  [driverid,bool]
    const response = await queryDatabase(query, requirements)
    return response
  }
  

  async function addPaypal(paypal,userid) {
    const query = `UPDATE credentials SET paypal_account = $1 WHERE userid = $2`
    const requirements = [paypal, userid]
    updateDB(query, requirements)
}



module.exports = {
    addAkahuToken,
    getAkahuToken,
    addAkahuHook,
    getAkahuHook,
    getAkahuTokenByUserID,
    getValidPayouts,
    getPayoutsByDriverid,
    deleteAkahuToken,
    addBankAccount,
    updateBankacc,
    getBankAccount,
    getBankAccountByUserID,
    addAkahuId,
    getAkahuId,
    getAkahuIdByUserID,
    deleteAkahuId,
    getStripeId,
    getStripeIdByUserID,
    creditDriver,
    setPayoutPaid,
    setPayoutRefunded,
    setPayoutCredited,
    setPayoutDisputed,
    setPayoutUndisputed,
    createPayout,
    getPayout,
    zeroCredit,
    payoutrequested,
    getDriversByRequestedPayout,
    addPaypal,
    getPaypalEmail,
    updatePaypal

}