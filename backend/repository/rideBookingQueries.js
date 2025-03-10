// Ride Booking
// holding requests in state, ie Requested, Accepted, Declined
// Driver may talk to Requested and Accepted, Messaging disables for Declined?

const { queryDatabase,updateDB } = require('./db')


async function requestRide(rideId, userId, price, seatsRequested,paymentType,paymentid,requestedOrigin,requestedOriginCoords,requesteddest,requesteddestcoords,distance,starttime) {
  let start = starttime; //passenger starttime
  if (!start) {
    start = null;
  }
  const query = `INSERT INTO ridebooking (rideId, userid, price, seatsrequested,paymenttype,requestedorigin,requestedorigincoords,paymentid,requesteddest,requesteddestcoords,distance,passenstarttime) VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`
  const requirements = [rideId, userId, price, seatsRequested,paymentType,requestedOrigin,requestedOriginCoords,paymentid,requesteddest,requesteddestcoords,distance,start]
  const response = await queryDatabase(query, requirements)
  return response;
}

async function getActiveRideRequests(rideId) {
  // Might wanna be able to order by the status
  const query = `SELECT * FROM ridebooking WHERE rideid = ${rideId} AND requeststatus NOT IN ('accepted', 'declined') ORDER BY price`
  const users = await queryDatabase(query)
  return users;
}

async function getDriverJoinRequests(userid) {
  // DEV Conal new query to get ride requests for a driver to review
  const query = `SELECT
  ride.*,
  ridebooking.seatsrequested
FROM
  ride
JOIN ridebooking
  ON ridebooking.userid = ride.passengerid
  AND ridebooking.rideid = ride.rideid
WHERE
  ride.passenger = true
  AND ride.passengerid = ${userid}
  AND ride.driverid != 1
  AND ride.status NOT IN ('completed','cancelled')
  AND ridebooking.requeststatus = 'pending'`
  const requests = await queryDatabase(query)
  return requests;
}

async function getDriverRideRequests(driverId) {
  // DEV Conal new query to get ride requests for a driver to review
  const query = `SELECT
  ridebooking.*
FROM
  ridebooking
JOIN ride
  ON ridebooking.rideid = ride.rideid
WHERE
  ride.driverid = ${driverId}
  AND ride.status NOT IN ('completed','cancelled')
  AND ride.passenger = false
  AND ridebooking.requeststatus NOT IN ('declined','accepted')`  
  const users = await queryDatabase(query)
  return users;
}

async function getPassengerRideRequests(userid) {
  // DEV Conal new query to get ride requests for a driver to review
  const query = `SELECT
  ridebooking.*
FROM
  ridebooking
JOIN ride
  ON ridebooking.rideid = ride.rideid
WHERE
  ridebooking.userid = ${userid}
  AND ride.status NOT IN ('completed','cancelled')
  AND ride.passenger = false
  AND ridebooking.requeststatus NOT IN ('declined')`  
  const users = await queryDatabase(query)
  return users;
}

async function getAcceptedRideRequests(rideId) {
  const query = `SELECT * FROM ridebooking WHERE rideid = ${rideId} AND requeststatus NOT IN ('pending', 'declined')`
  const rides = await queryDatabase(query)
  return rides;
}

async function getPendingRideRequests(userid) {
  const query = `SELECT * FROM ridebooking WHERE userid = ${userid} AND requeststatus = 'pending'`
  const rides = await queryDatabase(query)
  return rides;
}

async function getAcceptedAndUnPaidRideRequests(rideId) {
  const query = `SELECT * FROM ridebooking WHERE rideid = ${rideId} AND requeststatus NOT IN ('pending', 'declined') AND paid = false`
  const rides = await queryDatabase(query)
  return rides;
}

async function getRideRequest(rideId, userId) {
  const query = `SELECT * FROM ridebooking WHERE rideid = ${rideId} AND userid = ${userId} ORDER BY userid`
  const riderequest = await queryDatabase(query)
  return riderequest[0];
}

async function changeRequestStatus(rideId, userId, newStatus) {
  const query = `UPDATE ridebooking SET requeststatus = '${newStatus}' WHERE rideid = ${rideId} AND userid = ${userId} RETURNING *`
  const response = await queryDatabase(query)
  return response;
}

async function changePaidStatus(rideId, userId) {
  const query = `UPDATE ridebooking SET paid = true WHERE rideid = ${rideId} AND userid = ${userId} RETURNING *`
  const response = await queryDatabase(query)
  return response;
}
  
async function deleteRideRequest(rideId, userId) {
  const query = `DELETE FROM ridebooking WHERE rideid = ${rideId} AND userid = ${userId} RETURNING *`
  const response = await queryDatabase(query)
  return response[0];
}

async function deleteIgnoredRidesRequests(currTime) {
  
  const deleteQuery = `
  DELETE FROM ridebooking
  USING ride 
  WHERE 
    ride.rideid = ridebooking.rideid
    AND ride.status = 'scheduled'
    AND ridebooking.requeststatus IN ('pending','declined')
    AND ride.starttime < ${currTime}`;
    //Changed to delete all ridebookings that are expired (ride has happened)
  const response = await queryDatabase(deleteQuery)
  return response;
}

async function addTransactionId(txid,userid,rideid) {
  const query = `UPDATE ridebooking SET paymentid = $1 WHERE userid = $2 AND rideid = $3`
  const requirements = [txid,userid,rideid]
  await updateDB(query, requirements)
  return true;
}

async function addPaymentType(userid,rideid,type) {
  const query = `UPDATE ridebooking SET paymenttype = $1 WHERE userid = $2 AND rideid = $3`
  const requirements = [type,userid,rideid]
  await updateDB(query, requirements)
  return true;
}



module.exports = {
  requestRide,
  addPaymentType,
  getActiveRideRequests,
  getRideRequest,
  changeRequestStatus,
  getDriverJoinRequests,
  deleteRideRequest,
  getAcceptedRideRequests,
  getPendingRideRequests,
  changePaidStatus,
  getAcceptedAndUnPaidRideRequests,
  getDriverRideRequests,
  deleteIgnoredRidesRequests,
  addTransactionId,
  getPassengerRideRequests
}
  