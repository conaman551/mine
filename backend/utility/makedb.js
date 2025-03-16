path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createdb, dropdb } = require("pgtools");
const { Client } = require('pg');
// This can also be a connection string
// (in which case the database part is ignored and replaced with postgres)
const config = {
    user: process.env.user,
      password: process.env.password,
      port: process.env.dbport,
      host: process.env.dbhost,
      database: process.env.database
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

const text =

`

-- Drop tables and sequences if they exist
DROP TABLE IF EXISTS "ACTIVE_FILTERS";
DROP SEQUENCE IF EXISTS "ACTIVE_FILTERS_Filter_id_seq";
CREATE SEQUENCE "ACTIVE_FILTERS_Filter_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."ACTIVE_FILTERS" (
    "Filter_id" integer DEFAULT nextval('"ACTIVE_FILTERS_Filter_id_seq"') NOT NULL,
    "UID" integer NOT NULL,
    "Preference" text DEFAULT 'distance' NOT NULL,
    "Minimum_age" integer DEFAULT 0 NOT NULL,
    "Maximum_age" integer DEFAULT 100 NOT NULL,
    "Minimum_distance" integer DEFAULT 0 NOT NULL,
    "Maximum_distance" integer DEFAULT 10000 NOT NULL,
    CONSTRAINT "ACTIVE_FILTERS_Filter_id_UID" PRIMARY KEY ("Filter_id", "UID")
) WITH (oids = false);

-- Insert initial values into ACTIVE_FILTERS
INSERT INTO "ACTIVE_FILTERS" ("Filter_id", "UID", "Preference", "Minimum_age", "Maximum_age", "Minimum_distance", "Maximum_distance") VALUES
(33, 486, 'distance', 0, 100, 0, 10000),
(34, 494, 'distance', 0, 100, 0, 10000),
-- Continue with the rest of your values
(44, 512, 'distance', 0, 100, 0, 10000);

-- Create other tables
DROP TABLE IF EXISTS "ACTIVE_TAGS";
CREATE TABLE "public"."ACTIVE_TAGS" (
    "Tag_id" integer NOT NULL,
    "UID" integer NOT NULL,
    CONSTRAINT "ACTIVE_TAGS_Tag_id_UID" PRIMARY KEY ("Tag_id", "UID")
) WITH (oids = false);

DROP TABLE IF EXISTS "BLOCKS";
CREATE TABLE "public"."BLOCKS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    CONSTRAINT "BLOCKS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

DROP TABLE IF EXISTS "CHAT";
DROP SEQUENCE IF EXISTS "CHAT_Chat_id_seq";
CREATE SEQUENCE "CHAT_Chat_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."CHAT" (
    "Chat_id" integer DEFAULT nextval('"CHAT_Chat_id_seq"') NOT NULL,
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_started" date NOT NULL,
    CONSTRAINT "CHAT_Chat_id" PRIMARY KEY ("Chat_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "LIKES";
CREATE TABLE "public"."LIKES" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_liked" time without time zone NOT NULL,
    CONSTRAINT "LIKES_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

DROP TABLE IF EXISTS "MATCHED";
CREATE TABLE "public"."MATCHED" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_matched" time without time zone NOT NULL,
    CONSTRAINT "MATCHED_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

DROP TABLE IF EXISTS "MAYBE";
CREATE TABLE "public"."MAYBE" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    CONSTRAINT "MAYBE_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "MAYBE" ("UID1", "UID2") VALUES
(494, 501),
(494, 499),
-- Continue with the rest of your values
(494, 496);

DROP TABLE IF EXISTS "MESSAGES";
DROP SEQUENCE IF EXISTS "MESSAGES_Chat_id_seq";
CREATE SEQUENCE "MESSAGES_Chat_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."MESSAGES" (
    "Chat_id" integer DEFAULT nextval('"MESSAGES_Chat_id_seq"') NOT NULL,
    "Sender_id" integer NOT NULL,
    "Content" text NOT NULL,
    "Time_sent" timestamp NOT NULL,
    "Time_received" timestamp
) WITH (oids = false);

DROP TABLE IF EXISTS "REJECTS";
CREATE TABLE "public"."REJECTS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Date_rejected" date NOT NULL,
    CONSTRAINT "REJECTS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "REJECTS" ("UID1", "UID2", "Date_rejected") VALUES
(494, 512, '2024-11-12'),
(494, 497, '2024-11-12');

DROP TABLE IF EXISTS "REPORTS";
CREATE TABLE "public"."REPORTS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Reason" text NOT NULL,
    CONSTRAINT "REPORTS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "REPORTS" ("UID1", "UID2", "Reason") VALUES
(486, 501, 'Harassment');

DROP TABLE IF EXISTS "TAG_LIST";
DROP SEQUENCE IF EXISTS "TAG_LIST_Tag_id_seq";
CREATE SEQUENCE "TAG_LIST_Tag_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."TAG_LIST" (
    "Tag_id" integer DEFAULT nextval('"TAG_LIST_Tag_id_seq"') NOT NULL,
    "Tag_name" text NOT NULL,
    "Tag_type" text NOT NULL,
    CONSTRAINT "TAG_LIST_pkey" PRIMARY KEY ("Tag_id")
) WITH (oids = false);

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS "users_UID_seq";
CREATE SEQUENCE "users_UID_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE IF NOT EXISTS "users" (
    "UID" SERIAL,
    "Phone_number" text,
    "First_name" text,
    "Last_name" text,
    "Gender" text,
    "Gender_pref" text,
    "Category_1_id" text DEFAULT 'Sports',
    "Category_2_id" text DEFAULT 'Hobby',
    "Category_3_id" text DEFAULT 'Wildcard',
    "Category_4_id" text DEFAULT 'Food',
    "Bio" text,
    "Category_1_image_url" text,
    "Category_2_image_url" text,
    "Category_3_image_url" text,
    "Category_4_image_url" text,
    "DOB" date,
    "Password" text,
    "Phone_number_verification" text,
    "Main_image_id" integer DEFAULT 1 NOT NULL,
    "Country_code" text,
    "email" text,
    "google_id" VARCHAR(100),
    "apple_id" VARCHAR(100),
    "Smoking_tag" text,
    "Drinking_tag" text,
    "position" point,
    CONSTRAINT "USER_Email" UNIQUE ("Email"),
    CONSTRAINT "USER_Phone_number" UNIQUE ("Phone_number"),
    CONSTRAINT "USER_pkey" PRIMARY KEY ("UID")
) WITH (oids = false);


INSERT INTO "users" ("UID", "Phone_number", "First_name", "Last_name", "Gender", "Gender_pref", "Category_1_id", "Category_2_id", "Category_3_id", "Category_4_id", "Bio", "Category_1_image_url", "Category_2_image_url", "Category_3_image_url", "Category_4_image_url", "Latitude", "Longitude", "DOB", "Password", "Valid", "Phone_number_verification", "Main_image_id", "Country_code", "Email", "Smoking_tag", "Drinking_tag") VALUES
(501,	'009',	'Beyonce',	'Carter',	'Female',	'Male',	'Career',	'Fav Food',	'Fashion',	'Travel',	'Singer, dancer, new mum. ',	'Category_1_user_501.jpg',	'Category_2_user_501.jpg',	'Category_3_user_501.jpg',	'Category_4_user_501.jpg',	'-36.852312554113325',	'174.76799118113067',	'1989-03-05',	'Password1',	't',	'423076',	1,	'+64',	NULL,	NULL,	NULL),
(499,	'006',	'Chaewon',	'Kim',	'Female',	'Male',	'Career',	'Fav Food',	'Hobby',	'Travel',	'Kpop idol, dream chaser, home body. Swipe right if you’re into meaningful convos and late night playlists.',	'Category_1_user_499.jpg',	'Category_2_user_499.jpg',	'Category_3_user_499.jpg',	'Category_4_user_499.jpg',	'-36.85359891603931',	'174.76849823296388',	'2000-09-01',	'Password1',	't',	'328612',	1,	'+64',	NULL,	NULL,	NULL),
(495,	'999',	'Tester',	'1',	'Male',	'Female',	NULL,	NULL,	NULL,	NULL,	'Hi',	'Category_1_user_495.jpg',	'Category_2_user_495.jpg',	'Category_3_user_495.jpg',	'Category_4_user_495.jpg',	'-36.85362157374126',	'174.768467815362',	'2001-02-01',	'Password1',	't',	'488408',	1,	'+64',	NULL,	NULL,	NULL),
(506,	'1110',	'Alice',	'Smith',	'Female',	'Male',	'Sports',	'Hobby',	'Wildcard',	'Food',	'Love to play basketball',	'Category_1_user_143.jpg',	'Category_2_user_143.jpg',	'Category_3_user_143.jpg',	'Category_4_user_143.jpg',	'40.7128',	'-74.0060',	'1990-01-01',	'password1',	't',	NULL,	1,	'US',	'alic23e@example.com',	'No',	'Yes'),
(507,	'12321110',	'Alice',	'Smith',	'Female',	'Male',	'Sports',	'Hobby',	'Wildcard',	'Food',	'Love to play basketball',	'Category_1_user_143.jpg',	'Category_2_user_143.jpg',	'Category_3_user_143.jpg',	'Category_4_user_143.jpg',	'40.7128',	'-74.0060',	'1990-01-01',	'password1',	't',	NULL,	1,	'US',	'alic23213e@example.com',	'No',	'Yes'),
(512,	'2222222',	'Cynthia',	'Xie',	'Female',	'Male',	'Travel',	'Career',	'Travel',	'Hobby',	'Hi

',	'Category_1_user_512.jpg',	'Category_2_user_512.jpg',	'Category_3_user_512.jpg',	'Category_4_user_512.jpg',	'-36.853374',	'174.7684811',	'2003-09-19',	'A88888888',	't',	'132930',	1,	'+64',	NULL,	NULL,	NULL),
(504,	'33',	'Dd',	'Ss',	'Other',	'Both',	'Family',	'Fashion',	'Personality',	'Travel',	'Hi!',	'Category_1_user_504.jpg',	'Category_2_user_504.jpg',	'Category_3_user_504.jpg',	'Category_4_user_504.jpg',	'-36.8310832',	'174.6073153',	'2000-03-25',	'Testing1',	't',	'279615',	1,	'+64',	NULL,	NULL,	NULL),
(486,	'100',	'Greg',	'Dankey',	'Male',	'Female',	NULL,	NULL,	NULL,	NULL,	'Temp tony',	'Category_1_user_486.jpg',	'Category_2_user_486.jpg',	'Category_3_user_486.jpg',	'Category_4_user_486.jpg',	'-36.861161196620394',	'174.65073795345157',	'2003-11-07',	'Password1',	't',	'394172',	1,	'+64',	NULL,	NULL,	NULL),
(497,	'003',	'Han',	'So-hee',	'Female',	'Male',	'Social',	'Hobby',	'Career',	'Travel',	'Hi, I''m looking to date!',	'Category_1_user_497.jpg',	'Category_2_user_497.jpg',	'Category_3_user_497.jpg',	'Category_4_user_497.jpg',	'-36.8534411',	'174.7684151',	'1994-12-18',	'Password3',	't',	'303870',	1,	'+64',	NULL,	NULL,	NULL),
(496,	'001',	'Ariana',	'Grande',	'Female',	'Male',	'Career',	'Fashion',	'Sports',	'Fav Food',	'Singer, Dessert enthusiast, coffee lover, dog mum.',	'Category_1_user_496.jpg',	'Category_2_user_496.jpg',	'Category_3_user_496.jpg',	'Category_4_user_496.jpg',	'-36.85360671458012',	'174.7685023473214',	'1993-03-02',	'Password1',	't',	'329826',	1,	'+64',	NULL,	NULL,	NULL),
(500,	'008',	'Jessica',	'Alba',	'Female',	'Male',	'Hobby',	'Travel',	'Fashion',	'Career',	'Actress by trade, wellness advocate by passion. Always seeking adventure and a good netflix binge. Catch me hiking, at a yoga class, or whipping up a healthy recipe.',	'Category_1_user_500.jpg',	'Category_2_user_500.jpg',	'Category_3_user_500.jpg',	'Category_4_user_500.jpg',	'-36.85226119791855',	'174.76802045657615',	'1992-03-01',	'Password1',	't',	'173968',	1,	'+64',	NULL,	NULL,	NULL),
(498,	'004',	'Rihanna',	'Fenty',	'Female',	'Male',	'Career',	'Travel',	'Hobby',	'Fashion',	'Multi-tasking mogul, singer, actress, island girl at heart, fenty aficionado. Let’s vibe over music, fashion and world dominance.',	'Category_1_user_498.jpg',	'Category_2_user_498.jpg',	'Category_3_user_498.jpg',	'Category_4_user_498.jpg',	'-36.85360993615391',	'174.76849633097913',	'1988-02-01',	'Password1',	't',	'875329',	1,	'+64',	NULL,	NULL,	NULL),
(494,	'1',	'Tony',	'Schaufelberger',	'Male',	'Female',	'Fashion',	'Career',	'Hobby',	'Fav Food',	'This is changed bio',	'Category_1_user_494.jpg',	'Category_2_user_494.jpg',	'Category_3_user_494.jpg',	'Category_4_user_494.jpg',	'-36.858554211570684',	'174.5977521832928',	'2003-11-07',	'Password1',	't',	'330123',	1,	'+64',	NULL,	NULL,	NULL);

ALTER TABLE ONLY "public"."ACTIVE_FILTERS" ADD CONSTRAINT "ACTIVE_FILTERS_UID_fkey" FOREIGN KEY ("UID") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."ACTIVE_TAGS" ADD CONSTRAINT "ACTIVE_TAGS_Tag_id_fkey" FOREIGN KEY ("Tag_id") REFERENCES "TAG_LIST"("Tag_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."ACTIVE_TAGS" ADD CONSTRAINT "ACTIVE_TAGS_UID_fkey" FOREIGN KEY ("UID") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."BLOCKS" ADD CONSTRAINT "BLOCKS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."BLOCKS" ADD CONSTRAINT "BLOCKS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."CHAT" ADD CONSTRAINT "CHAT_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."CHAT" ADD CONSTRAINT "CHAT_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."LIKES" ADD CONSTRAINT "LIKES_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."LIKES" ADD CONSTRAINT "LIKES_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MATCHED" ADD CONSTRAINT "MATCHED_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MATCHED" ADD CONSTRAINT "MATCHED_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MAYBE" ADD CONSTRAINT "MAYBE_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MAYBE" ADD CONSTRAINT "MAYBE_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MESSAGES" ADD CONSTRAINT "MESSAGES_Chat_id_fkey" FOREIGN KEY ("Chat_id") REFERENCES "CHAT"("Chat_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MESSAGES" ADD CONSTRAINT "MESSAGES_Sender_id_fkey" FOREIGN KEY ("Sender_id") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."REJECTS" ADD CONSTRAINT "REJECTS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."REJECTS" ADD CONSTRAINT "REJECTS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."REPORTS" ADD CONSTRAINT "REPORTS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."REPORTS" ADD CONSTRAINT "REPORTS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

`

execute(text).then(result => {
    if (result) {
        console.log('Table created');
    }
  });


  /* DROP TABLE IF EXISTS "ACTIVE_FILTERS";
DROP SEQUENCE IF EXISTS "ACTIVE_FILTERS_Filter_id_seq";
CREATE SEQUENCE "ACTIVE_FILTERS_Filter_id_seq" INCREMENT  MINVALUE  MAXVALUE  CACHE ;

CREATE TABLE "public"."ACTIVE_FILTERS" (
    "Filter_id" integer DEFAULT nextval('"ACTIVE_FILTERS_Filter_id_seq"') NOT NULL,
    "UID" integer NOT NULL,
    "Preference" text DEFAULT 'distance' NOT NULL,
    "Minimum_age" integer DEFAULT '0' NOT NULL,
    "Maximum_age" integer DEFAULT '100' NOT NULL,
    "Minimum_distance" integer DEFAULT '0' NOT NULL,
    "Maximum_distance" integer DEFAULT '10000' NOT NULL,
    CONSTRAINT "ACTIVE_FILTERS_Filter_id_UID" PRIMARY KEY ("Filter_id", "UID")
) WITH (oids = false);

INSERT INTO "ACTIVE_FILTERS" ("Filter_id", "UID", "Preference", "Minimum_age", "Maximum_age", "Minimum_distance", "Maximum_distance") VALUES
(33,	486,	'distance',	0,	100,	0,	10000),
(34,	494,	'distance',	0,	100,	0,	10000),
(35,	495,	'distance',	0,	100,	0,	10000),
(36,	497,	'distance',	0,	100,	0,	10000),
(37,	496,	'distance',	0,	100,	0,	10000),
(38,	498,	'distance',	0,	100,	0,	10000),
(39,	499,	'distance',	0,	100,	0,	10000),
(40,	500,	'distance',	0,	100,	0,	10000),
(41,	501,	'distance',	0,	100,	0,	10000),
(42,	504,	'distance',	0,	100,	0,	10000),
(44,	512,	'distance',	0,	100,	0,	10000);

DROP TABLE IF EXISTS "ACTIVE_TAGS";
CREATE TABLE "public"."ACTIVE_TAGS" (
    "Tag_id" integer NOT NULL,
    "UID" integer NOT NULL,
    CONSTRAINT "ACTIVE_TAGS_Tag_id_UID" PRIMARY KEY ("Tag_id", "UID")
) WITH (oids = false);


DROP TABLE IF EXISTS "BLOCKS";
CREATE TABLE "public"."BLOCKS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    CONSTRAINT "BLOCKS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);


DROP TABLE IF EXISTS "CHAT";
DROP SEQUENCE IF EXISTS "CHAT_Chat_id_seq";
CREATE SEQUENCE "CHAT_Chat_id_seq" INCREMENT  MINVALUE  MAXVALUE  CACHE ;

CREATE TABLE "public"."CHAT" (
    "Chat_id" integer DEFAULT nextval('"CHAT_Chat_id_seq"') NOT NULL,
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_started" date NOT NULL,
    CONSTRAINT "CHAT_Chat_id" PRIMARY KEY ("Chat_id")
) WITH (oids = false);


DELIMITER ;;

CREATE TRIGGER "table_update_trigger" AFTER DELETE OR INSERT OR UPDATE ON "public"."CHAT" FOR EACH ROW EXECUTE FUNCTION notify_table_update();;

DELIMITER ;

DROP TABLE IF EXISTS "LIKES";
CREATE TABLE "public"."LIKES" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_liked" time without time zone NOT NULL,
    CONSTRAINT "LIKES_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);


DROP TABLE IF EXISTS "MATCHED";
CREATE TABLE "public"."MATCHED" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Time_matched" time without time zone NOT NULL,
    CONSTRAINT "MATCHED_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);


DROP TABLE IF EXISTS "MAYBE";
CREATE TABLE "public"."MAYBE" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    CONSTRAINT "MAYBE_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "MAYBE" ("UID1", "UID2") VALUES
(494,	501),
(494,	499),
(494,	506),
(494,	507),
(494,	496);

DROP TABLE IF EXISTS "MESSAGES";
DROP SEQUENCE IF EXISTS "MESSAGES_Chat_id_seq";
CREATE SEQUENCE "MESSAGES_Chat_id_seq" INCREMENT  MINVALUE  MAXVALUE  CACHE ;

CREATE TABLE "public"."MESSAGES" (
    "Chat_id" integer DEFAULT nextval('"MESSAGES_Chat_id_seq"') NOT NULL,
    "Sender_id" integer NOT NULL,
    "Content" text NOT NULL,
    "Time_sent" timestamp NOT NULL,
    "Time_received" timestamp
) WITH (oids = false);


DROP TABLE IF EXISTS "REJECTS";
CREATE TABLE "public"."REJECTS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Date_rejected" date NOT NULL,
    CONSTRAINT "REJECTS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "REJECTS" ("UID1", "UID2", "Date_rejected") VALUES
(494,	512,	'2024-11-12'),
(494,	497,	'2024-11-12');

DROP TABLE IF EXISTS "REPORTS";
CREATE TABLE "public"."REPORTS" (
    "UID1" integer NOT NULL,
    "UID2" integer NOT NULL,
    "Reason" text NOT NULL,
    CONSTRAINT "REPORTS_UID1_UID2" PRIMARY KEY ("UID1", "UID2")
) WITH (oids = false);

INSERT INTO "REPORTS" ("UID1", "UID2", "Reason") VALUES
(486,	501,	'Harassment');

DROP TABLE IF EXISTS "TAG_LIST";
DROP SEQUENCE IF EXISTS "TAG_LIST_Tag_id_seq";
CREATE SEQUENCE "TAG_LIST_Tag_id_seq" INCREMENT  MINVALUE  MAXVALUE  CACHE ;

CREATE TABLE "public"."TAG_LIST" (
    "Tag_id" integer DEFAULT nextval('"TAG_LIST_Tag_id_seq"') NOT NULL,
    "Tag_name" text NOT NULL,
    "Tag_type" text NOT NULL,
    CONSTRAINT "TAG_LIST_pkey" PRIMARY KEY ("Tag_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS "USER_UID_seq";
CREATE SEQUENCE "USER_UID_seq" INCREMENT  MINVALUE  MAXVALUE  CACHE ;

CREATE TABLE "public"."users" (
    "UID" integer DEFAULT nextval('"USER_UID_seq"') NOT NULL,
    "Phone_number" text,
    "First_name" text,
    "Last_name" text,
    "Gender" text,
    "Gender_pref" text,
    "Category_1_id" text DEFAULT 'Sports',
    "Category_2_id" text DEFAULT 'Hobby',
    "Category_3_id" text DEFAULT 'Wildcard',
    "Category_4_id" text DEFAULT 'Food',
    "Bio" text,
    "Category_1_image_url" text,
    "Category_2_image_url" text,
    "Category_3_image_url" text,
    "Category_4_image_url" text,
    "Latitude" text,
    "Longitude" text,
    "DOB" date,
    "Password" text,
    "Valid" boolean DEFAULT false NOT NULL,
    "Phone_number_verification" text,
    "Main_image_id" integer DEFAULT '1' NOT NULL,
    "Country_code" text,
    "Email" text,
    "Smoking_tag" text,
    "Drinking_tag" text,
    CONSTRAINT "USER_Email" UNIQUE ("Email"),
    CONSTRAINT "USER_Phone_number" UNIQUE ("Phone_number"),
    CONSTRAINT "USER_pkey" PRIMARY KEY ("UID")
) WITH (oids = false);

INSERT INTO "users" ("UID", "Phone_number", "First_name", "Last_name", "Gender", "Gender_pref", "Category_1_id", "Category_2_id", "Category_3_id", "Category_4_id", "Bio", "Category_1_image_url", "Category_2_image_url", "Category_3_image_url", "Category_4_image_url", "Latitude", "Longitude", "DOB", "Password", "Valid", "Phone_number_verification", "Main_image_id", "Country_code", "Email", "Smoking_tag", "Drinking_tag") VALUES
(501,	'009',	'Beyonce',	'Carter',	'Female',	'Male',	'Career',	'Fav Food',	'Fashion',	'Travel',	'Singer, dancer, new mum. ',	'Category_1_user_501.jpg',	'Category_2_user_501.jpg',	'Category_3_user_501.jpg',	'Category_4_user_501.jpg',	'-36.852312554113325',	'174.76799118113067',	'1989-03-05',	'Password1',	't',	'423076',	1,	'+64',	NULL,	NULL,	NULL),
(499,	'006',	'Chaewon',	'Kim',	'Female',	'Male',	'Career',	'Fav Food',	'Hobby',	'Travel',	'Kpop idol, dream chaser, home body. Swipe right if you’re into meaningful convos and late night playlists.',	'Category_1_user_499.jpg',	'Category_2_user_499.jpg',	'Category_3_user_499.jpg',	'Category_4_user_499.jpg',	'-36.85359891603931',	'174.76849823296388',	'2000-09-01',	'Password1',	't',	'328612',	1,	'+64',	NULL,	NULL,	NULL),
(495,	'999',	'Tester',	'1',	'Male',	'Female',	NULL,	NULL,	NULL,	NULL,	'Hi',	'Category_1_user_495.jpg',	'Category_2_user_495.jpg',	'Category_3_user_495.jpg',	'Category_4_user_495.jpg',	'-36.85362157374126',	'174.768467815362',	'2001-02-01',	'Password1',	't',	'488408',	1,	'+64',	NULL,	NULL,	NULL),
(506,	'1110',	'Alice',	'Smith',	'Female',	'Male',	'Sports',	'Hobby',	'Wildcard',	'Food',	'Love to play basketball',	'Category_1_user_143.jpg',	'Category_2_user_143.jpg',	'Category_3_user_143.jpg',	'Category_4_user_143.jpg',	'40.7128',	'-74.0060',	'1990-01-01',	'password1',	't',	NULL,	1,	'US',	'alic23e@example.com',	'No',	'Yes'),
(507,	'12321110',	'Alice',	'Smith',	'Female',	'Male',	'Sports',	'Hobby',	'Wildcard',	'Food',	'Love to play basketball',	'Category_1_user_143.jpg',	'Category_2_user_143.jpg',	'Category_3_user_143.jpg',	'Category_4_user_143.jpg',	'40.7128',	'-74.0060',	'1990-01-01',	'password1',	't',	NULL,	1,	'US',	'alic23213e@example.com',	'No',	'Yes'),
(512,	'2222222',	'Cynthia',	'Xie',	'Female',	'Male',	'Travel',	'Career',	'Travel',	'Hobby',	'Hi

',	'Category_1_user_512.jpg',	'Category_2_user_512.jpg',	'Category_3_user_512.jpg',	'Category_4_user_512.jpg',	'-36.853374',	'174.7684811',	'2003-09-19',	'A88888888',	't',	'132930',	1,	'+64',	NULL,	NULL,	NULL),
(504,	'33',	'Dd',	'Ss',	'Other',	'Both',	'Family',	'Fashion',	'Personality',	'Travel',	'Hi!',	'Category_1_user_504.jpg',	'Category_2_user_504.jpg',	'Category_3_user_504.jpg',	'Category_4_user_504.jpg',	'-36.8310832',	'174.6073153',	'2000-03-25',	'Testing1',	't',	'279615',	1,	'+64',	NULL,	NULL,	NULL),
(486,	'100',	'Greg',	'Dankey',	'Male',	'Female',	NULL,	NULL,	NULL,	NULL,	'Temp tony',	'Category_1_user_486.jpg',	'Category_2_user_486.jpg',	'Category_3_user_486.jpg',	'Category_4_user_486.jpg',	'-36.861161196620394',	'174.65073795345157',	'2003-11-07',	'Password1',	't',	'394172',	1,	'+64',	NULL,	NULL,	NULL),
(497,	'003',	'Han',	'So-hee',	'Female',	'Male',	'Social',	'Hobby',	'Career',	'Travel',	'Hi, I''m looking to date!',	'Category_1_user_497.jpg',	'Category_2_user_497.jpg',	'Category_3_user_497.jpg',	'Category_4_user_497.jpg',	'-36.8534411',	'174.7684151',	'1994-12-18',	'Password3',	't',	'303870',	1,	'+64',	NULL,	NULL,	NULL),
(496,	'001',	'Ariana',	'Grande',	'Female',	'Male',	'Career',	'Fashion',	'Sports',	'Fav Food',	'Singer, Dessert enthusiast, coffee lover, dog mum.',	'Category_1_user_496.jpg',	'Category_2_user_496.jpg',	'Category_3_user_496.jpg',	'Category_4_user_496.jpg',	'-36.85360671458012',	'174.7685023473214',	'1993-03-02',	'Password1',	't',	'329826',	1,	'+64',	NULL,	NULL,	NULL),
(500,	'008',	'Jessica',	'Alba',	'Female',	'Male',	'Hobby',	'Travel',	'Fashion',	'Career',	'Actress by trade, wellness advocate by passion. Always seeking adventure and a good netflix binge. Catch me hiking, at a yoga class, or whipping up a healthy recipe.',	'Category_1_user_500.jpg',	'Category_2_user_500.jpg',	'Category_3_user_500.jpg',	'Category_4_user_500.jpg',	'-36.85226119791855',	'174.76802045657615',	'1992-03-01',	'Password1',	't',	'173968',	1,	'+64',	NULL,	NULL,	NULL),
(498,	'004',	'Rihanna',	'Fenty',	'Female',	'Male',	'Career',	'Travel',	'Hobby',	'Fashion',	'Multi-tasking mogul, singer, actress, island girl at heart, fenty aficionado. Let’s vibe over music, fashion and world dominance.',	'Category_1_user_498.jpg',	'Category_2_user_498.jpg',	'Category_3_user_498.jpg',	'Category_4_user_498.jpg',	'-36.85360993615391',	'174.76849633097913',	'1988-02-01',	'Password1',	't',	'875329',	1,	'+64',	NULL,	NULL,	NULL),
(494,	'1',	'Tony',	'Schaufelberger',	'Male',	'Female',	'Fashion',	'Career',	'Hobby',	'Fav Food',	'This is changed bio',	'Category_1_user_494.jpg',	'Category_2_user_494.jpg',	'Category_3_user_494.jpg',	'Category_4_user_494.jpg',	'-36.858554211570684',	'174.5977521832928',	'2003-11-07',	'Password1',	't',	'330123',	1,	'+64',	NULL,	NULL,	NULL);

ALTER TABLE ONLY "public"."ACTIVE_FILTERS" ADD CONSTRAINT "ACTIVE_FILTERS_UID_fkey" FOREIGN KEY ("UID") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."ACTIVE_TAGS" ADD CONSTRAINT "ACTIVE_TAGS_Tag_id_fkey" FOREIGN KEY ("Tag_id") REFERENCES "TAG_LIST"("Tag_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."ACTIVE_TAGS" ADD CONSTRAINT "ACTIVE_TAGS_UID_fkey" FOREIGN KEY ("UID") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."BLOCKS" ADD CONSTRAINT "BLOCKS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."BLOCKS" ADD CONSTRAINT "BLOCKS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."CHAT" ADD CONSTRAINT "CHAT_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."CHAT" ADD CONSTRAINT "CHAT_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."LIKES" ADD CONSTRAINT "LIKES_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."LIKES" ADD CONSTRAINT "LIKES_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MATCHED" ADD CONSTRAINT "MATCHED_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MATCHED" ADD CONSTRAINT "MATCHED_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MAYBE" ADD CONSTRAINT "MAYBE_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MAYBE" ADD CONSTRAINT "MAYBE_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."MESSAGES" ADD CONSTRAINT "MESSAGES_Chat_id_fkey" FOREIGN KEY ("Chat_id") REFERENCES "CHAT"("Chat_id") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."MESSAGES" ADD CONSTRAINT "MESSAGES_Sender_id_fkey" FOREIGN KEY ("Sender_id") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."REJECTS" ADD CONSTRAINT "REJECTS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."REJECTS" ADD CONSTRAINT "REJECTS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."REPORTS" ADD CONSTRAINT "REPORTS_UID1_fkey" FOREIGN KEY ("UID1") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."REPORTS" ADD CONSTRAINT "REPORTS_UID2_fkey" FOREIGN KEY ("UID2") REFERENCES "users"("UID") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

------------------------- */