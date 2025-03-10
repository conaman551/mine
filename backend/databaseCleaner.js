const db = require('./database_connector/databaseConnection');


async function deleteOldRecords() {
	console.log("Begin database cleanup process");
  const query = `DELETE FROM "USER" WHERE "Valid"=FALSE`;
  try {
    const res = await db.client.query(query);
    console.log(`Deleted ${res.rowCount} invalid records.`);
  } catch (error) {
    console.error('Error deleting invalid records', error.stack);
  }
}

module.exports = { deleteOldRecords };

