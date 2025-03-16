const db = require('../database_connector/databaseConnection');
const nodemailer = require('nodemailer');


const getChatListByUid = async (req, res) => {
	const { uid } = req.params;

	try {
		const result = await db.client.query(
			`SELECT C.*, m."Content", m."Sender_id", U."First_name", m."Time_sent", U."Main_image_id", U."Category_1_image_url"
FROM "CHAT" AS C
LEFT JOIN (
    SELECT "Chat_id", "Content", "Time_sent", "Sender_id"
    FROM "MESSAGES"
    WHERE ("Chat_id", "Time_sent") IN (
        SELECT "Chat_id", MAX("Time_sent")
        FROM "MESSAGES"
        GROUP BY "Chat_id"
    )
) AS m ON C."Chat_id" = m."Chat_id", "users" AS U
WHERE ("UID1" = $1 AND "UID"="UID2") OR ("UID2" = $1 AND "UID"="UID1")`, [uid]);
        const chatListUsers = result.rows;

	    if (chatListUsers.length == 0) {
		res.status(200).json(chatListUsers);
	    }
	    let i = 0;
	chatListUsers.forEach(async (user) => {
		console.log(i)
		const test1 = user.Category_1_image_url;
			//console.log(test1);
		chatListUsers[i].url1 = test1;
	})
	res.status(200).json(chatListUsers);
	} catch (err) {
		console.error('Error getting chat list for user', err);
		res.status(500).json({ error: 'Failed to get user chat list' });
	}
}

const getMessagesByChatId = async (req, res) => {
	const { __, chatid } = req.params;

	try {
		const result = await db.client.query(
			`SELECT M.*
			FROM "MESSAGES" AS M
			WHERE M."Chat_id" = $1
			`, [chatid]);
		console.log(chatid);
		res.json(result.rows);
	} catch (err) {
		console.error('Error getting chat list for user', err);
		res.status(500).json({ error: 'Failed to get user chat list' });
	}
}

const sendMessage = async (req, res) => {
	const { ___, chatid } = req.params;
	const { uid, Content } = req.body;
	const Time_sent = new Date().toISOString().slice(0, 19).replace('T', ' ');
	try {
		const result = await db.client.query(`
		INSERT INTO "MESSAGES" ("Chat_id", "Sender_id", "Content", "Time_sent", "Time_received")
		VALUES ($2, $1, $3, $4, $5)
		RETURNING *
		`,[uid, chatid, Content, Time_sent, null]);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error("Error sending message", err);
		res.status(500).json({ error: 'Failed to send message' });
	}
}

const updateReadStatus = async (req, res) => {
	const {uid, chatid} = req.params;
	const Time_received = new Date().toISOString().slice(0, 19).replace('T', ' ');
	try {
		const result = await db.client.query(`
		UPDATE "MESSAGES"
		SET "Time_received"=$1
		WHERE $2 != "Sender_id" AND $3 = "Chat_id" AND "Time_received" IS NOT NULL
		RETURNING *
		`, [Time_received, uid, chatid]);
		res.status(201).json(result.rows);
	} catch (err) {
		console.error("Error reading messages", err);
		res.status(500).json({ error: 'Failed to update message' });
	}
}


const unmatch = async (req, res) => {
	const {s1, uid1, uid2} = req.params;
	try {
		const result = await db.client.query(`
		DELETE FROM "MATCHED"
		WHERE ("UID1"=$1 AND "UID2"=$2) OR ("UID2"=$1 AND "UID1"=$2)
		RETURNING *
		`, [uid1, uid2]);
		const result2 = await db.client.query(`
		DELETE FROM "CHAT"
		WHERE ("UID1"=$1 AND "UID2"=$2) OR ("UID2"=$1 AND "UID1"=$2)
		RETURNING *
		`, [uid1, uid2]);
		if (result.rows.length > 0 && result2.rows.length > 0) {
			res.json({ message: "Successfully unmatched" });
		} else {
			res.status(404).json({ error: "Matching not found" });
	}
	} catch (err) {
		console.error("Error deleting match", err);
		res.status(500).json({ error: 'Failed to unmatch' });
	}
}

const reportUser = async (req, res) => {
    const { s1, uid1, uid2 } = req.params; 
    const { Reason } = req.body;
	console.log(Reason);

    try {
        const result = await db.client.query(`
            INSERT INTO "REPORTS" ("UID1", "UID2", "Reason")
            VALUES ($1, $2, $3)
            RETURNING *
        `, [uid1, uid2, Reason]);

        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to report the user.' });
        }

        const userQuery = `
            SELECT "UID", "First_name", "Last_name", "Phone_number"
            FROM "users"
            WHERE "UID" = $1 OR "UID" = $2`;
        const userResult = await db.client.query(userQuery, [uid1, uid2]);

        const [user1, user2] = userResult.rows;

        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One of the users not found.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
				
            },
        });

        const mailOptions = {
            from: 'sojuboju123@gmail.com',
            to: 'sojuboju123@gmail.com',
            subject: `New Report by ${user1.First_name} ${user1.Last_name}`,
            text: `
                A new report has been made.

                Reporter Details:
                Name: ${user1.First_name} ${user1.Last_name}
                Phone: ${user1.Phone_number}

                Reported User Details:
                Name: ${user2.First_name} ${user2.Last_name}
                Phone: ${user2.Phone_number}

                Reason for Report: ${Reason}
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Report submitted successfully', report: result.rows[0] });

    } catch (err) {
        console.error('Error reporting the user:', err);
        res.status(500).json({ error: 'Failed to report the user' });
    }
};


// get all reports made on a user
const reportsUser = async (req, res) => {
    const { uid1 } = req.params; 


    try {
        const result = await db.client.query(`
            SELECT "UID1", "UID2", "Reason"
            FROM "REPORTS"
            WHERE "UID2" = $1
        `, [uid1]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No reports found for this user.' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving reports", err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
};


// get all reports a user has made
const reportedUser = async (req, res) => {
    const { uid1 } = req.params; 

    try {
        const result = await db.client.query(`
            SELECT "UID1", "UID2", "Reason"
            FROM "REPORTS"
            WHERE "UID1" = $1
        `, [uid1]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No reports found for this user.' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving reports", err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
}


const blockUser = async (req, res) => {
	const {s1, uid1, uid2} = req.params;
	try {
		const result = await db.client.query(`
			INSERT INTO "BLOCKS" ("UID1", "UID2")
			VALUES ($1, $2)
			RETURNING *
		`, [uid1, uid2]);
		res.status(201).json(result.rows);
	} catch (err) {
		console.error("Error blocking the user", err);
		res.status(500).json({ error: 'failed to block' });
	}
}

// see all users that you have blocked
const blockedUsers = async (req, res) => {
    const { uid1 } = req.params; 

    try {
        const result = await db.client.query(`
            SELECT "UID1", "UID2"
            FROM "BLOCKS"
            WHERE "UID1" = $1
        `, [uid1]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No blocked people found for this user.' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving blocked list", err);
        res.status(500).json({ error: 'Failed to blocked list' });
    }
}

module.exports = {
	getChatListByUid,
	getMessagesByChatId,
	sendMessage,
	updateReadStatus,
	unmatch,
	reportUser,
	blockUser,
	blockedUsers,
	reportedUser,
	reportsUser
}

