const { queryDatabase } = require('./db')

async function createRide(driverId, carid, startTime, startLocation, endLocation, duration, distance, price, seats, originCoord, destinationCoord,regularid,passenger,passengerid,flexable) {
 const query = `INSERT INTO ride ("driverid", "carid", "starttime", "origin", "destination", "duration", "distance", "price", "seats", "origincoordinates", "destinationcoordinates","regularid","passenger","passengerid","flexable") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13,$14,$15) RETURNING *`
  requirements = [driverId, carid, startTime, startLocation, endLocation, duration, distance, price, seats, originCoord, destinationCoord,regularid,passenger,passengerid,flexable]
  const response = await queryDatabase(query, requirements)
  return response
}

async function createRegular(driverid,starttimes,ongoing,lastgenerated) {
  const query = `INSERT INTO regular ("driverid","starttimes","ongoing","lastgenerated") VALUES ($1,$2,$3,$4) RETURNING regularid`
  let reqs = [driverid,starttimes,ongoing,lastgenerated]
  const response = await queryDatabase(query, reqs)
  return response
}

async function getRideByRegularID(regularid) {
   const query = `SELECT * FROM ride WHERE regularid = ${regularid} LIMIT 1`
   const response = await queryDatabase(query)
  return response[0]
}

async function getRidesByRegularID(regularid) {
  const query = `SELECT * FROM ride WHERE regularid = ${regularid} AND status = 'scheduled'`
  const response = await queryDatabase(query)
 return response
}

async function updateRegular(regularid,ongoing) {
  const query = `UPDATE regular SET ongoing = $2 WHERE regularid = $1 RETURNING *`
  let reqs = [regularid,ongoing]
  const ride = await queryDatabase(query,reqs)
  return ride;
}

async function getRegularByDriverId(driverId) {
  const query = `SELECT * FROM regular WHERE driverid = $1 AND ongoing = true`
  requirements = [driverId]
  const users = await queryDatabase(query,requirements)
  return users;
}

async function updateGenerate(regularid,starttimes,lastgenerated) {
  const query = `UPDATE regular SET starttimes = $2, lastgenerated = $3 WHERE regularid = $1 RETURNING *`
  let reqs = [regularid,starttimes,lastgenerated]
  const ride = await queryDatabase(query,reqs)
  return ride;
}

async function getAvailableRides() {
  const query = `SELECT * FROM ride`
  const rides = await queryDatabase(query)
  return rides;
}

async function recentlyCompleted() {
  let past = 1000 * 60 * 60 * 25
  let recent = Date.now() - past
  const query = `SELECT * FROM ride WHERE starttime BETWEEN ${recent} AND ${Date.now()}`
  const rides = await queryDatabase(query)
  return rides;
}

async function getTrueAvailableRides() {
  const query = `SELECT * FROM ride WHERE seats > 0 AND status = 'scheduled'`
  const rides = await queryDatabase(query)
  return rides;
}

async function getRideByRideId(rideId) {
  const query = `SELECT * FROM ride WHERE rideid = ${rideId}`
  const ride = await queryDatabase(query)
  return ride[0];
}

async function getPassengers(rideId) {
  const query = `SELECT * FROM ridebooking WHERE rideid = ${rideId} AND requeststatus = 'accepted'`
  const passengers = await queryDatabase(query)
  return passengers;
}

async function getAssociated(rideId) {
  const query = `SELECT DISTINCT COALESCE(ridebooking.userid, bookmark.userid) AS "userid" FROM ridebooking Full JOIN bookmark ON ridebooking.rideid = bookmark.rideid WHERE ((ridebooking.userid IS NOT NULL AND ridebooking.requeststatus != 'declined')OR bookmark.userid IS NOT NULL) AND (ridebooking.rideid = ${rideId} OR bookmark.rideid = ${rideId})`
  const associated = await queryDatabase(query)
  return associated;
}


async function getRidesByDriverId(driverId) {
  const query = `SELECT ride.* FROM ride WHERE driverid = $1 AND status NOT IN ('completed','cancelled')`
  requirements = [driverId]
  const users = await queryDatabase(query,requirements)
  return users;
}

async function getRidesByPassengerId(userid) {
  const query = `SELECT ride.*
FROM ride
WHERE passengerid = $1
  AND ride.status NOT IN ('completed', 'cancelled')
  AND NOT EXISTS (
    SELECT 1
    FROM ridebooking
    WHERE ridebooking.rideid = ride.rideid
)
`
  const requirements = [userid]
  const users = await queryDatabase(query,requirements)
  return users;
}

async function cancelRide(rideId) {
  const query = `DELETE FROM ride WHERE rideid = ${rideId} RETURNING *`
  const response = await queryDatabase(query)
  return response
}

async function deleteDriverRides(driverid) {
  const query = `DELETE FROM ride WHERE driverid = $1`
  const requirements = [driverid]
  const response = await queryDatabase(query,requirements)
  return true
}

async function updatePassengerRide(rideId,driverid,carid,seats,price,time) {
  const query = `UPDATE ride SET driverid = $2,carid = $3,seats = $4,price = $5, starttime = $6 WHERE rideid = $1;`
  const reqs = [rideId,driverid,carid,seats,price,time]
  const ride = await queryDatabase(query,reqs)
  return ride;
}

async function changePassengerRide(rideid,isPassenger) {
  const query = `UPDATE ride SET passenger = $2 WHERE rideid = $1;`
  const reqs = [rideid,isPassenger]
  const ride = await queryDatabase(query,reqs)
  return ride;
}

// updateRide(rideId, status)
async function updateRideIsCompleted(rideId) {
  const query = `UPDATE ride SET status = 'completed' WHERE rideId = ${rideId} RETURNING *`
  const ride = await queryDatabase(query)
  return ride;
}

async function updateRidesSetCompleted(now) {
  const query = `UPDATE ride
SET status = 'completed'
WHERE 
    starttime < ${now}
    AND EXISTS (
        SELECT 1
        FROM payout
        WHERE payout.rideid = ride.rideid
    );`
 queryDatabase(query)
}

async function changeRideStatus(rideId, newStatus) {
  const query = `UPDATE ride SET status = '${newStatus}' WHERE rideId = ${rideId} RETURNING *`
  const ride = await queryDatabase(query)
  return ride;
}

async function changeRideSeats(rideId, seats) {
  const query = `UPDATE ride SET seats = '${seats}' WHERE rideId = ${rideId} RETURNING *`
  const ride = await queryDatabase(query)
  return ride;
}

//seems to be half finished
async function findUsersAssociatedWithRide(rideId) {
  const query = `SELECT userid FROM ridebooking JOIN  `
  const ride = await queryDatabase(query)
  return ride;
}

async function updatePriceByRideId(rideId, newPrice) {
  const query = `UPDATE ride SET price = $2 WHERE rideid = $1 RETURNING *`
  requirements = [rideId, newPrice]
  const response = await queryDatabase(query, requirements)
  return response
}

async function getRegularNew() {
  const query = `SELECT
  regular.*,
  ride.*
FROM
  ride
JOIN regular
  ON ride.regularid = regular.regularid 
WHERE
  regular.ongoing = true`
const rides = await queryDatabase(query)
return rides;
}

async function getRegular(weekago) {
  const query = `SELECT
  regular.*,
  ride.*
FROM
  ride
JOIN regular
  ON  ride.regularid = regular.regularid 
WHERE
  regular.ongoing = true
  AND regular.lastgenerated < ${weekago}
  AND ride.status NOT IN ('completed')`
  
const rides = await queryDatabase(query)
return rides;
}

async function getAvailableRidesAndRequest(userid) {
  const query = `SELECT
    ride.*,
    ridebooking.*
  FROM
    ride
  JOIN ridebooking
    ON  ride.rideid = ridebooking.rideid 
  WHERE
    ridebooking.userid = ${userid}
    AND ride.passenger = false
    AND ride.status NOT IN ('completed','cancelled')`
  const rides = await queryDatabase(query)
  return rides;
}

async function cancelRecentRegularRides(currTime) {
  //Developer Conal made this delete instead of select
 
  //Delete Statement
  const cancelQuery = `
  UPDATE ride
  SET status = 'cancelled'
  WHERE 
    status = 'scheduled'
    AND regularid IS NOT NULL
    AND starttime < ${currTime} 
  AND NOT EXISTS (
        SELECT 1
        FROM payout
        WHERE payout.rideid = ride.rideid
  ) 
  `;
  //Developer Conal made this delete instead of select
  const response = await queryDatabase(cancelQuery)
  return response;
}

async function deleteRecentEmptyRides(currTime) {
  //Developer Conal made this delete instead of select
 
  //Delete Statement
  const deleteQuery = `
  DELETE FROM ride
  WHERE 
    ride.status = 'scheduled'
    AND ride.starttime < ${currTime} 
  AND NOT EXISTS (
        SELECT 1
        FROM payout
        WHERE payout.rideid = ride.rideid
  ) 
  `;
  //Developer Conal made this delete instead of select
  const response = await queryDatabase(deleteQuery)
  return response;
}

module.exports = {
  createRide,
  createRegular,
  updateRegular,
  updateGenerate,
  getRegularByDriverId,
  getRegular,
  getRegularNew,
  getRideByRegularID,
  getRidesByRegularID,
  getAvailableRides,
  getRideByRideId,
  changePassengerRide,
  getRidesByDriverId,
  getRidesByPassengerId,
  deleteDriverRides,
  cancelRide,
  updateRideIsCompleted,
  updateRidesSetCompleted,
  updatePassengerRide,
  changeRideStatus,
  findUsersAssociatedWithRide,
  getPassengers,
  getAssociated,
  updatePriceByRideId,
  getAvailableRidesAndRequest,
  changeRideSeats,
  getTrueAvailableRides,
  recentlyCompleted,
  deleteRecentEmptyRides,
  cancelRecentRegularRides
}