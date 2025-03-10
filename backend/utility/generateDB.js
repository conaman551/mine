//path = require('path')
//require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createdb, dropdb } = require("pgtools");
const { Client } = require('pg');
// This can also be a connection string
// (in which case the database part is ignored and replaced with postgres)
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

const client = new Client(config);

const execute = async (query) => {
  try {
    await createdb(config, config.database)
    await client.connect();     // gets connection
    await client.query(query);  // sends queries
    return true;
  } catch (error) {
      console.error(error.stack);
      return false;
  } finally {
      await client.end();         // closes connection
  }
};

const text = `

  CREATE TABLE IF NOT EXISTS "USER" (
    "UID" SERIAL,
    "First_name" VARCHAR(100) NOT NULL,
    "Last_name" VARCHAR(50), 
    "Gender" VARCHAR(50),
    "Gender_pref" VARCHAR(50),
    "Category_1_id" VARCHAR(20),
    "Category_2_id" VARCHAR(20),
    "Category_3_id" VARCHAR(20),
    "Category_4_id" VARCHAR(20),
    "Category_1_image_url" VARCHAR(150),
    "Category_2_image_url" VARCHAR(150),
    "Category_3_image_url" VARCHAR(150),
    "Category_4_image_url" VARCHAR(150),
    "Main_image_url" VARCHAR(300),
    "Bio" VARCHAR(300),
    "Location" point NOT NULL,
    "DOB" TIMESTAMP,
    "Password" VARCHAR(50),
    "Phone_number" VARCHAR(20),
    "Country_code" VARCHAR(10),
    "Smoking_tag" VARCHAR(70),
    "Drinking_tag" VARCHAR(70),
    "Phone_number_verification VARCHAR(10)",
    "Email" VARCHAR(100) UNIQUE,
    "Valid" boolean not null default false,
    PRIMARY KEY ("UID")
  );

  CREATE TABLE IF NOT EXISTS "LIKES" (
    "UID1" INT NOT NULL,
    "UID2" INT NOT NULL,
    "Time_liked" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("UID1", "UID2"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
);

 CREATE TABLE IF NOT EXISTS "MAYBE" (
    "UID1" INT NOT NULL,
    "UID2" INT NOT NULL,
    PRIMARY KEY ("UID1", "UID2"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
);

CREATE TABLE IF NOT EXISTS "BLOCKS" (
    "UID1" INT NOT NULL,
    "UID2" INT NOT NULL,
    PRIMARY KEY ("UID1", "UID2"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
);


  CREATE TABLE IF NOT EXISTS "REPORTS" (
    "UID1" int NOT NULL,
    "UID2" int NOT NULL,
    "Report_id" SERIAL,
    "Reason"  VARCHAR(50) NOT NULL,
    PRIMARY KEY ("Report_id"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
  );

  CREATE TABLE IF NOT EXISTS "CHAT" (
   "Chat_id" serial,
   "UID1" INT NOT NULL,
   "UID2" INT NOT NULL,
   "Time_started" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("Chat_id"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
  );

  CREATE TABLE IF NOT EXISTS "messages" (
    "Chat_id" int NOT NULL,
    "Sender_id" int NOT NULL,
    "Content"  VARCHAR(300) NOT NULL,
    "Time_sent" VARCHAR(30) NOT NULL DEFAULT to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS'),
    "Time_received" VARCHAR(30) NOT NULL DEFAULT to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS'),
    FOREIGN KEY ("Chat_id") References chat(Chat_id),
    FOREIGN KEY ("Sender_id") References user(UID)
  );

  CREATE TABLE IF NOT EXISTS "ACTIVE_FILTERS" (
    "UID" int,
    "Maximum_distance" float NOT NULL,
    "Minimum_distance" float,
    "Maximum_age" int,
    "Minimum_age" int,
    "Preference" VARCHAR(50),
    FOREIGN KEY ("UID") References user(UID)
   );

   CREATE TABLE IF NOT EXISTS "REJECTS" (
    "UID1" INT NOT NULL,
    "UID2" INT NOT NULL,
    "Date_rejected" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("UID1", "UID2"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
  );


  CREATE TABLE IF NOT EXISTS "MATCHED" (
    "UID1" INT NOT NULL,
    "UID2" INT NOT NULL,
    "Time_matched" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("UID1", "UID2"),
    FOREIGN KEY ("UID1") REFERENCES USER(UID),
    FOREIGN KEY ("UID2") REFERENCES USER(UID)
  );

   `

execute(text).then(result => {
  if (result) {
      console.log('Table created');
  }
});