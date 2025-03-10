const { queryDatabase } = require('./db')

async function createReceipt (rideId, userId, startTime, startLocation, endLocation,seatsbooked, price,wasdriver) { //Update ride - iscompleted
    query = `INSERT INTO receipt ("rideid", "userid", "starttime", "startlocation", "endlocation","seatsbooked", "price","wasdriver") VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *`
    requirements =  [rideId, userId, startTime, startLocation, endLocation,seatsbooked, price,wasdriver]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function getReceiptsByUser (userId) {
    const query = `SELECT * FROM receipt WHERE userid = ${userId}`
    const reciepts = await queryDatabase(query)
    return reciepts;
  }
  
  async function getReceiptByRide (rideId) {
    const query = `SELECT * FROM receipt WHERE rideid = ${rideId}`
    const reciept = await queryDatabase(query)
    return reciept[0];
  }

module.exports = {
  createReceipt,
  getReceiptsByUser,
  getReceiptByRide
}