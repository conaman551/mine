const { queryDatabase } = require('./db');

// All functions here are legacy from the old routing system.
async function createRideRoute (rideId, userId, waypointsOrdered, duration, distance) {
    query = `INSERT INTO rideroute ("rideid",  "userid", "waypointsordered", "duration", "distance") VALUES ($1, $2, $3, $4, $5) RETURNING *`
    requirements =  [rideId, userId, waypointsOrdered, duration, distance]
    const response = await queryDatabase(query, requirements)
    return response
  }

async function getRideRouteByRideIdAndUserId(rideId, userId) {
  const query = `SELECT * FROM rideroute WHERE rideid = ${rideId} AND userid = ${userId}`
  //requirements =  [rideId, userId]
  const response = await queryDatabase(query)//, requirements)
  return response[0];
}

async function updateRideRoute (rideId, userId, waypointsOrdered) {
  const query = `UPDATE rideroute SET waypointsordered = $3 WHERE rideid = $1 AND userid = $2 RETURNING *`
  requirements =  [rideId, userId, waypointsOrdered]
  const response = await queryDatabase(query, requirements)
  return response
}

async function updateAllRideRoute (rideId, userId, waypointsOrdered, duration, distance) {
  const query = `UPDATE rideroute SET waypointsordered = $3, duration = $4, distance = $5 WHERE rideid = $1 AND userid = $2 RETURNING *`
  requirements =  [rideId, userId, waypointsOrdered, duration, distance]
  const response = await queryDatabase(query, requirements)
  return response
}

async function deleteRideRoute (rideId, userId) {
  const query = `DELETE FROM rideroute WHERE rideid = $1 AND userid = $2 RETURNING *`
  requirements =  [rideId, userId]
  const response = await queryDatabase(query, requirements)
  return response
}

module.exports = {
  createRideRoute,
  getRideRouteByRideIdAndUserId,
  updateRideRoute,
  deleteRideRoute,
  updateAllRideRoute
}