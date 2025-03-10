const { queryDatabase } = require('./db');

async function  createBookmark (userId, rideId) {
    //"Create Bookmark " + userId + " " + rideId)
    const query = `INSERT INTO bookmark ("userid", "rideid") VALUES ($1, $2) RETURNING *`
    requirements = [userId, rideId]
    const response = await queryDatabase(query, requirements)
    return response;
  }
  
  async function  getBookmarked (userId) {
    const query = `SELECT rideid FROM bookmark WHERE userid = ${userId}`
    const rides = await queryDatabase(query)
    return rides;
  }
  
  async function  removeBookmarked (userId, rideId) {
    const query = `DELETE FROM bookmark WHERE userid = ${userId} AND rideid = ${rideId} RETURNING *`
    const response = await queryDatabase(query)
    return response;
  }

  module.exports = {
    createBookmark,
    getBookmarked,
    removeBookmarked
}