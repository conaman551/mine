const { queryDatabase } = require('./db')

async function createReport (reporterId, reportedId, reportDescription) {
    query = `INSERT INTO report ("reporterid", "reportedid", "reportdescription") VALUES ($1, $2, $3) RETURNING *`
    requirements =  [reporterId, reportedId, reportDescription]
    const response = await queryDatabase(query, requirements)
    return response
  }
  
  async function getReport (reporterId, reportedId) {
    query = `SELECT * FROM report WHERE reporterid = $1 and reportedid = $2`
    requirements =  [reporterId, reportedId]
    const report = await queryDatabase(query, requirements)
    return report[0]
  }

  async function getReportedCount(reportedid) {
    const query = `SELECT COUNT(*) FROM report WHERE reportedid = $1`
    const requirements = [reportedid]
    const count = await queryDatabase(query,requirements)
    return count[0];
    }

  module.exports = {
    createReport,
    getReport,
    getReportedCount
}