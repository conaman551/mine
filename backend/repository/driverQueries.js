const { queryDatabase } = require('./db');

async function createDriver (licenseNumber, preferences) { //Need to update the users table driverid too.
    query = `INSERT INTO driver ("licensenumber","preferences") VALUES ($1, $2) RETURNING *`
    requirements =  [licenseNumber, preferences]
    const response = await queryDatabase(query, requirements)
    return response[0]
  }

   async function deleteDriver (driverid) {
   // let random = generateRandomString(7)
    // let randomnumber = generateNumber()
     let deleted = 'deleted'
     const query = `UPDATE driver
       SET licensenumber = $2
       WHERE driverid = $1;`
     const requirements = [driverid,deleted]
     await queryDatabase(query,requirements)
   }

  async function updateDriverId (userId, driverId) {
    query = `UPDATE users SET driverid = $2 WHERE userid = $1 RETURNING *`
    requirements =  [userId, driverId]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function getDriverByDriverId (driverId) {
    const query = `SELECT * FROM driver WHERE driverid = ${driverId}`
    const users = await queryDatabase(query)
    return users[0];
  }

  async function getDriverPayouts(userid) {
    const query = `SELECT * FROM payout WHERE userid = ${userid} AND credited = true`
    const users = await queryDatabase(query)
    return users;
  }
  
  async function getDriverByUserId (userId) {
    const query = `SELECT driver.* FROM driver INNER JOIN users ON users.driverid = driver.driverid AND users.userId = ${userId}`
    const users = await queryDatabase(query)
    return users[0];
  }
  
  async function getProfilePictureByUserId (userId) {
    const query = `SELECT driver.profilepicture FROM driver INNER JOIN users ON users.driverid = driver.driverid AND users.userId = ${userId}`
    const profilepicture = await queryDatabase(query)
    return profilepicture[0];
  }
  
  async function getAllDriverRideBookings(driverId) {
    query = `SELECT rb.*
    FROM ridebooking rb
    JOIN ride r ON rb.rideid = r.rideid
    WHERE r.driverId = ${driverId}
    AND r.status = 'completed'
    AND rb.requeststatus = 'accepted'`
    const response = await queryDatabase(query)
    return response
  }

  async function updateProfilePictureByDriverId(driverId, profilePicture) {
    query = `UPDATE driver SET profilepicture = $2 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, profilePicture]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function updateLicenseNumberByDriverId(driverId, licenseNumber) {
    query = `UPDATE driver SET licensenumber = $2 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, licenseNumber]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function updatePreferencesByDriverId(driverId, preferences) {
    query = `UPDATE driver SET preferences = $2 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, preferences]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function updateDriverDetailsByDriverId(driverId, licenseNumber, preferences) {
    query = `UPDATE driver SET licensenumber = $2, preferences = $3 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, licenseNumber, preferences]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function updateRidesDrivenByDriverId(driverId, ridesDriven) {
    query = `UPDATE driver SET ridesdriven = $2 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, ridesDriven]
    const response = await queryDatabase(query, requirements)
    return response
  }

  module.exports = {
    createDriver,
    deleteDriver,
    getDriverByDriverId,
    getDriverByUserId,
    getAllDriverRideBookings,
    getProfilePictureByUserId,
    updateProfilePictureByDriverId,
    updateLicenseNumberByDriverId,
    updatePreferencesByDriverId,
    updateDriverId,
    updateDriverDetailsByDriverId,
    updateRidesDrivenByDriverId,
    getDriverPayouts
}