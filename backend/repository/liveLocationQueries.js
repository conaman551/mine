const { queryDatabase } = require('./db');


async function createLiveLocation (latitude, longitude, rideId, driverId) {
    query = `INSERT INTO livelocation ("latitude",  "longitude", "rideid", "driverid") VALUES ($1, $2, $3, $4) RETURNING *`
    requirements =  [latitude, longitude, rideId, driverId]
    const response = await queryDatabase(query, requirements)
    return response
  }

  
  async function getLiveLocationByRideId (rideId) {
    const query = `SELECT * FROM livelocation WHERE rideId = ${rideId}`
    const location = await queryDatabase(query)
    return location[0];
  }
  
  
  async function updateLiveLocationByRideId (latitude, longitude, rideId) {
    query = `UPDATE livelocation SET latitude = $1, longitude = $2 WHERE rideid = $3 RETURNING *`
    requirements =  [latitude, longitude, rideId]
    const response = await queryDatabase(query, requirements)
    return response
  }

  module.exports = {
    createLiveLocation,
    getLiveLocationByRideId,
    updateLiveLocationByRideId
}