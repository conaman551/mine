const { queryDatabase } = require('./db');

async function  writeMessage (senderId, receiverId, description) {
    const query = `INSERT INTO message (senderid, receiverid, description) VALUES ($1, $2, $3) RETURNING *`
    const requirements = [senderId, receiverId, description]
    const response = await queryDatabase(query, requirements)
    return response;
  }
  

  async function getXMessagesFromY(messageNum, userid, otheruserid, messageOffset) {
    const query = `SELECT * FROM message WHERE (senderid = ${userid} AND receiverid = ${otheruserid}) OR (senderid = ${otheruserid} AND receiverid = ${userid})  ORDER BY timesent DESC LIMIT ${messageNum} OFFSET ${messageOffset};`
    const users = await queryDatabase(query)
    return users;
  }

  async function deleteOldMessages() {
    const query = `DELETE FROM message WHERE to_timestamp(timesent, 'YYYY-MM-DD HH24:MI:SS') < current_timestamp - interval '3 months';`
    const users = await queryDatabase(query)
    return users;
  }

  async function getAllMessagesForX(userid) { // this is fucking ass, check here when testing
    const query = `
    SELECT m1.*
    FROM message m1
    INNER JOIN (
      SELECT
        CASE
          WHEN senderid = ${userid} THEN receiverid
          WHEN receiverid = ${userid} THEN senderid
        END AS otheruserid,
        MAX(timesent) AS latest_time
      FROM message
      WHERE senderid = ${userid} OR receiverid = ${userid}
      GROUP BY otheruserid
    ) m2 ON (
      (m1.senderid = ${userid} AND m1.receiverid = m2.otheruserid) OR
      (m1.senderid = m2.otheruserid AND m1.receiverid = ${userid})
    )  AND m1.timesent = m2.latest_time
    ORDER BY timesent DESC;
    `
    const messages = await queryDatabase(query)
    return messages;
  }
 
  
module.exports = {
  writeMessage,
  getXMessagesFromY,
  getAllMessagesForX,
  deleteOldMessages
}