const { dropdb } = require("pgtools");

const config = {
    user: 'postgres',
    password: 'sojuboju',
    host: 'minedb1.chgplxc7sfps.ap-southeast-2.rds.amazonaws.com',
    port: '5432',
    database: 'minedb1',
    ssl: {
      rejectUnauthorized: false
    }
  };
  
  dropdb(config, config.database);