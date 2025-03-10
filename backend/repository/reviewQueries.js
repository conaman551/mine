const { queryDatabase } = require('./db')

async function  getAverageRating (userId) {
  const query = `SELECT AVG(r.starrating)
  FROM review r
  WHERE r.recipientid = ${userId}`
  const review = await queryDatabase(query)
  let rounded = Math.round(review[0].avg * 10) / 10
  return rounded;
}
// Driver Reviews

 // Replace 123 with the actual userid

async function  getDriversPendingReviews(driverId) {
  const query = `SELECT rb.userid, r.*
  FROM ride r
  JOIN driver d ON r.driverid = d.driverid AND r.status = 'completed'
  JOIN ridebooking rb ON r.rideid = rb.rideid AND rb.requeststatus = 'accepted'
  LEFT JOIN review rev ON r.rideid = rev.rideid AND rb.userid = rev.recipientid
  WHERE d.driverid = ${driverId}
  AND rev.reviewid IS NULL`
  const reviews = await queryDatabase(query)
  return reviews;
}

async function  getDriverReview (reviewId) {
    const query = `SELECT * FROM driverreview WHERE reviewId = ${reviewId}`
    const review = await queryDatabase(query)
    return review[0];
  }
  
  async function  getDriverReviews (driverId) {
    const query = `SELECT * FROM driverreview WHERE recipientid = ${driverId} ORDER BY datepublished DESC`
    const users = await queryDatabase(query)
    return users;
  }

  async function  getDriverReviewByRideIdAndPassengerId (rideId, passengerId) {
    const query = `SELECT * FROM driverreview WHERE reviewerid = ${passengerId} AND rideid = ${rideId}  ORDER BY datepublished DESC`
    const users = await queryDatabase(query)
    return users;
  }
  
  async function  writeDriverReview (reviewerid,recipientid,writtenreview,starrating,rideid) {
    let wasdriver = true
    const query = `INSERT INTO review ("reviewerid", "recipientid","rideid", "writtenreview", "starrating","wasdriver") VALUES ($1, $2, $3, $4,$5,$6) RETURNING *`
    const requirements = [reviewerid,recipientid,rideid,writtenreview,starrating,wasdriver]
    const response = await queryDatabase(query, requirements)
    return response;
  } 
  
  
  // PassengerReview

  async function  getPassengersPendingReviews(userId) {
    const query = `SELECT d.driverid, r.*
    FROM driver d
    JOIN ride r ON d.driverid = r.driverid AND r.status = 'completed'
    JOIN ridebooking rb ON r.rideid = rb.rideid AND rb.userid = ${userId} AND rb.requeststatus = 'accepted'
    WHERE NOT EXISTS (
        SELECT 1
        FROM review rev
        WHERE rev.reviewerid = rb.userid AND rev.rideid = r.rideid
    )`
    const reviews = await queryDatabase(query)
    return reviews;
  }
  
  async function  getPassengerReview (reviewId) {
    const query = `SELECT * FROM passengerreview WHERE reviewId = ${reviewId}`
    const review = await queryDatabase(query)
    return review[0];
  }
  
  async function  getReviews (userId) {
    const query = `SELECT * FROM review WHERE recipientid = ${userId} ORDER BY datepublished DESC`
    const reviews = await queryDatabase(query)
    return reviews;
  }

  async function getPassengerReviewByRideIdAndPassengerId (rideId, passengerId) {
    const query = `SELECT * FROM passengerreview WHERE recipientid = ${passengerId} AND rideid = ${rideId} ORDER BY datepublished DESC`
    const reviews = await queryDatabase(query)
    return reviews[0];
  }
  
  async function  writePassengerReview (reviewerid,recipientid, writtenreview, starrating,rideid) {
    const query = `INSERT INTO review ("reviewerid", "recipientid","rideid", "writtenreview", "starrating") VALUES ($1, $2, $3, $4,$5) RETURNING *`
    const requirements = [reviewerid,recipientid,rideid, writtenreview, starrating]
    const response = await queryDatabase(query, requirements)
    return response;
  } 

  module.exports = {
    getDriverReview,
    getDriverReviews,
    writeDriverReview,
    getPassengerReview,
    getReviews,
    getAverageRating,
    getDriversPendingReviews,
    getPassengersPendingReviews,
    writePassengerReview,
    getDriverReviewByRideIdAndPassengerId,
    getPassengerReviewByRideIdAndPassengerId
}