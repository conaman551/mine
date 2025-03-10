const { Client } = require('pg');
path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') });


const config = {
  user: process.env.user,
    password: process.env.password,
    port: process.env.dbport,
    host: process.env.dbhost,
    database: process.env.database
};

const client = new Client(config);

client
	.connect()
	.then(() => {
		console.log('Connected to PostgreSQL database');
	})
	.catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	});

module.exports = {
  client
};



