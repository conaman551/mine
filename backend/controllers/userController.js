const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
        FROM "USER"
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
    const { uid, gender } = req.body;

    if (!gender) {
        return res.status(400).json({ error: 'Gender is required' });
    }
	// Update database
    try {
        const result = await db.client.query(
        `UPDATE "USER"
        SET "Gender"=$1
        WHERE "UID"=$2`
            , [gender, uid])
        // Respond with success message
        return res.json({ message: 'Gender successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting firstName, surname
const submitName = async (req, res) => {
    const { uid, firstName, surname } = req.body;

    if (!firstName || !surname) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "USER"
        SET "First_name"=$1, "Last_name"=$2
        WHERE "UID"=$3`
        , [firstName, surname, uid])
        // Respond with success message
        return res.json({ message: 'User details successfully updated' });
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
        `UPDATE "USER"
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
    const { uid, day, month, year } = req.body;

    if (!day || !month || !year) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const dob = new Date(year, month, day).toISOString().slice(0, 19).replace('T', ' ');
    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "USER"
        SET "DOB"=$1
        WHERE "UID"=$2`
            , [dob, uid])

        // Respond with success message
        return res.json({ message: 'User details successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting preference
const submitPreference = async (req, res) => {
    const { uid, preference } = req.body;

    if (!preference) {
        return res.status(400).json({ error: 'Preference is required' });
    }

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "USER"
        SET "Gender_pref"=$1
        WHERE "UID"=$2`
            , [preference, uid])

        // Respond with success message
        return res.json({ message: 'Preference successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// Function for submitting address
const submitAddress = async (req, res) => {
    const { uid, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        // Update database
        const result = await db.client.query(
        `UPDATE "USER"
        SET "Latitude"=$1, "Longitude"=$2
        WHERE "UID"=$3`
            , [latitude, longitude, uid])

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
        `UPDATE "USER"
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
	`UPDATE "USER"
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
        FROM "USER"
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
        const result = await db.client.query(
        `UPDATE "USER"
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
        console.log("tags not implemented yet")

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
        `UPDATE "USER"
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
    const { uid, ___ } = req.params;
    try {
        const result = await db.client.query(
            `SELECT *
            FROM "USER"
            WHERE "UID"=$1`,
            [uid]
        )
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
        `DELETE FROM "USER"
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
    sendVariables,
    sendEmail,
	deleteUser,
    
}




