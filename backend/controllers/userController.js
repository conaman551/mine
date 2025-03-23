const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryDatabase } = require('../repository/db');
const { getUserByEmail } = require('../repository/userRepo');
const db = require('../database_connector/databaseConnection');
const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Ensure your API key is set

// Load the AWS SDK for Node.js
//var AWS = require("aws-sdk");
// Set region
//AWS.config.update({ region: "ap-southeast-2" });


const crypto = require('crypto');


const generateVerificationCode = () => {
    // Generate a random 6-digit code
    const code = crypto.randomInt(100000, 1000000); // 100000 is inclusive, 1000000 is exclusive
    return code.toString(); // Ensure it returns as a string
};


// Function for login
const login = async (req, res) => {
    const { number, password } = req.body;

    // Check if number is provided
    if (!number) {
        return res.status(400).json({ message: "Phone number not provided" });
    }

    // Check if password is provided
    if (!password) {
        return res.status(400).json({ message: "Password not provided" });
    }

    try {
        // Find the user by phone number
        const result = await db.client.query(
        `SELECT "UID", "Password"
        FROM "users"
        WHERE "Phone_number"=$1`
            , [number])
        const uid = result.rows[0]["UID"];
        const fetchedPassword = result.rows[0]["Password"]
        console.log(result.rows[0]);
        console.log(uid);
   
        // Compare the hashed password with the provided password
        if (password == fetchedPassword) {
            return res.json({ uid: uid });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: "Server error" });
    }
};




// Function for submitting gender
const submitGender = async (req, res) => {
    const { gender } = req.body;
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }

    if (!gender) {
        return res.status(400).json({ error: 'Gender is required' });
    }
	// Update database
    try {
        const resp = await queryDatabase(
        `UPDATE "users"
        SET "Gender"=$1
        WHERE "email"=$2 RETURNING *`
            , [gender, user.email])
        // Respond with success message
        return res.json({ message:resp[0]});
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting firstName, surname
const submitName = async (req, res) => {
    const { firstName, surname } = req.body;
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }

    if (!firstName || !surname) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Update database
       const resp = await queryDatabase(
        `UPDATE "users"
        SET "First_name" = $1, "Last_name" = $2
        WHERE "email" = $3
        RETURNING *;`
        , [firstName, surname, user.email])
        // Respond with success message
        return res.json({ message:resp[0]});
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Function for submitting password
const submitPassword = async (req, res) => {
    const { uid, password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "users"
        SET "Password"=$1
        WHERE "UID"=$2`
        , [password, uid])
        // Respond with success message
        return res.json({ message: 'User password successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Logic  for submitting dob
const submitDob = async (req, res) => {
    const { day, month, year } = req.body;
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }
    if (!day || !month || !year) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const dob = new Date(year, month - 1, day).toISOString().slice(0, 19).replace('T', ' ');
    try {
        // Update database
        const resp = await queryDatabase(
        `UPDATE "users"
        SET "DOB"=$1
        WHERE "email"=$2 RETURNING *;`
            , [dob,user.email])

        // Respond with success message
        return res.json({message:resp[0]});
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting preference
const submitPreference = async (req, res) => {
    const { preference } = req.body;
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }

    if (!preference) {
        return res.status(400).json({ error: 'Preference is required' });
    }

    try {
        // Update database
        const resp = await queryDatabase(
        `UPDATE "users"
        SET "Gender_pref"=$1
        WHERE "email"=$2 RETURNING *`
            , [preference, user.email])

        // Respond with success message
        return res.json({ message:resp[0]});
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Function for submitting preference
const submitCats = async (req, res) => {
    const { cats } = req.body;
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }

    if (!cats || cats.length !== 4) {
        console.log('bad cats')
        return res.status(400).json({ error: 'Bad cats' });
    }
    let count = 1;
    for (let cat of cats) {
        const string_cat_name = 'Category_'+count+'_id';
        await queryDatabase(
            `UPDATE "users"
            SET "${string_cat_name}"=$1
            WHERE "email"=$2
            RETURNING *`, [cat, user.email]
          );
        count++;
    }
    return res.json({ message: 'Cats successfully updated' });
};



// Function for submitting address
const submitAddress = async (req, res) => {
    const { uid, latitude, longitude } = req.body;
    const positionString = `(${latitude}, ${longitude})`;
    console.log('position str',positionString);

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        // Update database
       await db.client.query(
        `UPDATE "users"
        SET "position"=$1
        WHERE "UID"=$2`
            ,[positionString,uid])

        // Respond with success message
        return res.json({ message: 'Address successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting mobile number
const submitNumber = async (req, res) => {
    const { uid, countryCode, mobileNumber } = req.body;

    if (!countryCode || !mobileNumber) {
        return res.status(400).json({ error: 'Country code and mobile number are required' });
    }

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "users"
        SET "Phone_number"=$1, "Country_code"=$2
        WHERE "UID"=$3`
            , [mobileNumber, countryCode, uid])

	const verificationCode = generateVerificationCode();

	// Create publish parameters
	var params = {
	  Message: "Your verification code is " + verificationCode /* required */,
	  PhoneNumber: countryCode + mobileNumber,
	};

	

	const result_verify = await db.client.query(
	`UPDATE "users"
	SET "Phone_number_verification"=$1
	WHERE "UID"=$2
		`
	, [verificationCode.toString(), uid]);

        // Respond with success message
        return res.json({ message: 'Mobile number successfully updated and verification code sent' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const checkCode = async (req, res) => {
	const { uid, code } = req.body;

	if (!code) {
        return res.status(400).json({ error: 'Code is required' });
	}

    try {
        // Update database
        const result = await db.client.query(
        `SELECT "Phone_number_verification"
        FROM "users"
        WHERE "UID"=$1`
            , [uid])

	// if correct, respond with success
	if (result.rows[0]["Phone_number_verification"] == code) {
        // Respond with a success message
        	return res.json({ message: 'Correct code supplied' });
	} else {
		return res.status(401).json({ message: 'Incorrect code supplied' });
	}
    } catch (error) {
        // Respond with an error message
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function for submitting bio
const submitBio = async (req, res) => {
    const { uid, bio } = req.body;

    if (!bio) {
        return res.status(400).json({ error: 'Bio is required' });
    }

    try {
        // Update database
        await db.client.query(
        `UPDATE "users"
        SET "Bio"=$1
        WHERE "UID"=$2`
            , [bio, uid])

        // Respond with a success message
        return res.json({ message: 'Bio successfully updated' });
    } catch (error) {
        // Respond with an error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting habits
const submitPreferences = async (req, res) => {
    const { uid, drinking, smoking } = req.body;

    if (drinking === undefined || smoking === undefined) {
        return res.status(400).json({ error: 'Both drinking and smoking preferences are required' });
    }

    try {
        // Update the temporary user preferences
    //    console.log("tags not implemented yet")
        await db.client.query(
            `UPDATE "users"
            SET "Smoking_tag"=$1, "Drinking_tag"=$2
            WHERE "UID"=$3`
                , [smoking, drinking, uid])
          
        // Respond with a success message
        return res.json({ message: 'Preferences successfully updated' });
    } catch (error) {
        // Respond with an error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const submitUser = async (req, res) => {
    const { uid } = req.body;

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "users"
        SET "Valid"=TRUE
        WHERE "UID"=$1`
            , [uid])

        const result2 = await db.client.query(
        `INSERT INTO "ACTIVE_FILTERS" ("UID")
        VALUES ($1)`
            , [uid]);

        // Respond with a success message
        return res.json({ message: 'User successfully validated' });
    } catch (error) {
        // Respond with an error message
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const sendVariables = async (req,res) => {
    const email = req.user.email;
    console.log('email',email)
    try {
        const result = await db.client.query(
            `SELECT *
            FROM "users"
            WHERE "email"=$1`,
            [email]
        )
        console.log('res',result)
        // Respond with a success message
        return res.json(result.rows[0]);
        
    } catch (error) {
        // Respond with an error message
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const sendEmail = async (req,res)  => {
    const { emailAddress } = req.body;

    if (!emailAddress) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
	    const verificationCode = generateVerificationCode();
        
        return res.json({ message: 'Email successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteUser = async (req, res) => {
	const { ____, uid } = req.params;
	// Update database
    try {
        const result = await db.client.query(
        `DELETE FROM "users"
        WHERE "UID"=$1`
            , [uid])
        // Respond with success message
	    
	
        return res.json({ message: 'User successfully deleted' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
}



module.exports = {
    login,
    submitGender,
    submitName,
    submitPassword,
    submitDob,
    submitPreference,
    submitAddress,
    submitNumber,
    checkCode,
    submitBio,
    submitPreferences,
    submitUser,
    submitCats,
    sendVariables,
    sendEmail,
	deleteUser,
    
}




