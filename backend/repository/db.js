const Pool = require('pg').Pool
path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

let config;
if(process.env.dbhost != "localhost"){
  //"AWS Call")
  config = {
    user: process.env.user,
    password: process.env.password,
    port: process.env.dbport,
    host: process.env.dbhost,
    database: process.env.database,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  config = {
    user: process.env.user,
    password: process.env.password,
    port: process.env.dbport,
    host: process.env.dbhost,
    database: process.env.database
  };
}

const pool = new Pool(config)

// This function sends queries to DB, this works for all CRUD operations. Please handle error in your other functions to keep this one simple


async function queryDatabase(query, requirements) {
  try {
    const result = await pool.query(query, requirements);
    return result.rows;
  } catch (error) {
    console.error('Error querying database:', error); 
    return error
  }
}

async function querySingleData(query,requirements) {
  try {
    const result = await pool.query(query, requirements);
    return result.rows[0];
  } catch (error) {
    console.error('Error querying database:', error); 
    return error
  }
}

async function updateDB(query,requirements) {
  try {
    await pool.query(query,requirements);
  } catch(err) {
    console.log('error updating database',err);
  }
}

module.exports = {
    queryDatabase,
    querySingleData,
    updateDB,
    pool
}