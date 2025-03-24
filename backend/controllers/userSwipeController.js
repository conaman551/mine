const db = require('../database_connector/databaseConnection');
const { getUserByEmail } = require('../repository/userRepo');


// Haversine formula
const calculateDistance = (pos1, pos2) => {
    const lat1 = pos1.x;
    const lat2 = pos2.x;
    const lon1 = pos1.y;
    const lon2 = pos2.y;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
};


const getUserDetails = async (req, res) => {
    const { uid } = req.params;

    try {
        const query = `
            SELECT 
                *,
                EXTRACT(YEAR FROM AGE("users"."DOB")) AS "Age"
            FROM "users"
            WHERE "UID" = $1
        `;

        const result = await db.client.query(query, [uid]);
        const user = result.rows[0];

        user.url1 = user.Category_1_image_url;
        user.url2 = user.Category_2_image_url;
        user.url3 = user.Category_3_image_url;
        user.url4 = user.Category_4_image_url;
	
        res.status(200).json(user);



    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};


const getUserCards = async (req, res) => {
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }
	const currentUserId = user.UID;
	try {
        // Get the current user's filters
        const filterQuery = `SELECT * FROM "ACTIVE_FILTERS" WHERE "UID" = $1`;
        const filterResult = await db.client.query(filterQuery, [currentUserId]);
        const userFilters = filterResult.rows[0]; // Assuming there is only one filter per user

        if (!userFilters) {
            return res.status(404).json({ error: 'No filters found for the current user.' });
        }

        const { Minimum_age, Maximum_age, Minimum_distance, Maximum_distance, Preference } = userFilters;

        // Get current user's location, age, gender, and gender preference
        const currentUserQuery = `SELECT "position", EXTRACT(YEAR FROM AGE("DOB")) AS age, "Gender", "Gender_pref" 
                                  FROM "users" WHERE "UID" = $1`;
        const currentUserResult = await db.client.query(currentUserQuery, [currentUserId]);
        const currentUser = currentUserResult.rows[0];

        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found.' });
        }

        const { position:posit, age: currentUserAge, Gender: currentUserGender, Gender_pref: currentUserGenderPref } = currentUser;

        // Get potential users who match the age range and gender preference
        const potentialUsersQuery = `
            SELECT 
                "users"."UID", 
                "users"."First_name", 
                "users"."Last_name", 
                "users"."position",  
                EXTRACT(YEAR FROM AGE("users"."DOB")) AS age, 
                "users"."Gender", 
                "users"."Gender_pref",
		"users"."Category_1_image_url",
		"users"."Category_2_image_url",
		"users"."Category_3_image_url",
		"users"."Category_4_image_url",
                "users"."Category_1_id", 
                "users"."Category_2_id", 
                "users"."Category_3_id", 
                "users"."Category_4_id",
		"users"."Bio"
            FROM "users"
            WHERE "users"."UID" != $1
            AND EXTRACT(YEAR FROM AGE("DOB")) BETWEEN $2 AND $3
            AND "users"."Gender" = $4
            AND "users"."Gender_pref" = $5
        `;
        
        const potentialUsersResult = await db.client.query(potentialUsersQuery, [currentUserId, Minimum_age, Maximum_age, currentUserGenderPref, currentUserGender]);
        let potentialUsers = potentialUsersResult.rows;
        //console.log(potentialUsers);
        // Exclude users that the current user has already interacted with
        const interactedUsersQuery = `
            SELECT "UID2" FROM "MATCHED" WHERE ("UID1" = $1 OR "UID2" = $1)
            UNION
            SELECT "UID2" FROM "LIKES" WHERE ("UID1" = $1 OR "UID2" = $1)
            UNION
            SELECT "UID2" FROM "REJECTS" WHERE ("UID1" = $1 OR "UID2" = $1)
            UNION
            SELECT "UID2" FROM "MAYBE" WHERE ("UID1" = $1 OR "UID2" = $1)
	    UNION
            SELECT "UID1" FROM "MATCHED" WHERE ("UID1" = $1 OR "UID2" = $1)
        `;
        const interactedUsersResult = await db.client.query(interactedUsersQuery, [currentUserId]);
        const interactedUsers = interactedUsersResult.rows.map(row => row.UID2);

      
        // Filter out users that have already been interacted with
        potentialUsers = potentialUsers.filter(user => !interactedUsers.includes(user.UID));
        //console.log(potentialUsers)
         
        // Calculate distance for each potential user and filter by distance
        potentialUsers = potentialUsers
            .map(user => {
                const distance = calculateDistance(posit, user.position);
                console.log(distance)
                return { ...user, distance: distance.toFixed(2) }; 
            })
            .filter(user => user.distance >= Minimum_distance && user.distance <= Maximum_distance);


	    if (potentialUsers.length == 0) {
		res.status(200).json(potentialUsers);
	    }

	var i = 0;
	potentialUsers.forEach(async (user) => {
		console.log(i)
		
		potentialUsers[i].url1 = user.Category_1_image_url;
		potentialUsers[i].url2 = user.Category_2_image_url;
		potentialUsers[i].url3 = user.Category_3_image_url;
		potentialUsers[i].url4 = user.Category_4_image_url;
		i = i + 1;

		if (i == potentialUsers.length) {
        if (Preference === 'distance') {
            potentialUsers.sort((a, b) => a.distance - b.distance); // Sort by shortest distance first
        } else if (Preference === 'age') {
            potentialUsers.sort((a, b) => a.age - b.age); // Sort by youngest first
        }
		console.log("test");

        // Send filtered and sorted user cards with distances
        res.status(200).json(potentialUsers);
	console.log(potentialUsers);
		}

	})

	

} catch (err) {
		console.error('Error getting category image for user', err);
		res.status(500).json({ error: 'Failed to get category image' });
	}
}; 


const likeUser = async (req, res) => {
    const currentUserId = req.params.user_id; 
    const user_id = req.params.target_user_id;
    try {
	    let type = "liked";
        await db.client.query('BEGIN');

        await db.client.query(
            'INSERT INTO "LIKES" ("UID1", "UID2", "Time_liked") VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [currentUserId, user_id]
        );

        const checkIfMaybeList = await db.client.query(
            'SELECT * FROM "MAYBE" WHERE "UID1" = $1 AND "UID2" = $2',
            [currentUserId, user_id] 
        );
        
        if (checkIfMaybeList.rows.length > 0) {
            await db.client.query(
                'DELETE FROM "MAYBE" WHERE "UID1" = $1 AND "UID2" = $2',
                [currentUserId, user_id] 
            );
        }

        // Check if the liked user also likes the current user
        const result = await db.client.query(
            'SELECT * FROM "LIKES" WHERE "UID1" = $1 AND "UID2" = $2',
            [user_id, currentUserId]
        );

        if (result.rows.length > 0) {
            // Mutual like found
            await db.client.query(
                'INSERT INTO "MATCHED" ("UID1", "UID2", "Time_matched") VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [currentUserId, user_id]
            );

            await db.client.query(
                'INSERT INTO "CHAT" ("UID1", "UID2", "Time_started") VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [currentUserId, user_id]
            );

            //  Clean likes table
            await db.client.query(
                'DELETE FROM "LIKES" WHERE ("UID1" = $1 AND "UID2" = $2) OR ("UID1" = $2 AND "UID2" = $1)',
                [currentUserId, user_id]
            );
		type = "matched";
		console.log("user was matched");
        }

        // Commit transaction
        await db.client.query('COMMIT');

        res.status(200).json({ message: 'User liked successfully', type: type });
    } catch (err) {
        // Rollback transaction on error
        await db.client.query('ROLLBACK');
        console.error('Error liking user:', err);
        res.status(500).json({ error: 'Failed to like user' });
    }
};





const dislikeUser = async (req, res) => {
    const currentUserId = req.params.user_id; 
    const user_id = req.params.target_user_id;

    try {
        await db.client.query('BEGIN');

        await db.client.query(
            'INSERT INTO "REJECTS" ("UID1", "UID2", "Date_rejected") VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [currentUserId, user_id]
        );

        await db.client.query(
            'DELETE FROM "LIKES" WHERE ("UID1" = $1 AND "UID2" = $2) OR ("UID2" = $1 AND "UID1" = $2)',
            [currentUserId, user_id]
        );


        await db.client.query('COMMIT');

        res.status(200).json({ message: 'User disliked successfully' });
    } catch (err) {
        await db.client.query('ROLLBACK');
        console.error('Error disliking user:', err);
        res.status(500).json({ error: 'Failed to dislike user' });
    }
};

const addUserToMaybeList = async (req, res) => {
    const currentUserId = req.params.user_id; 
    const user_id = req.params.target_user_id;

    try {
        await db.client.query('BEGIN');

        const result = await db.client.query(
            'SELECT COUNT(*) FROM "MAYBE" WHERE "UID1" = $1',
            [currentUserId]
        );
        const count = parseInt(result.rows[0].count, 10);

        if (count >= 5) {
            res.status(400).json({ message: 'Maybe list is full' });
            await db.client.query('ROLLBACK');
            return;
        }

        await db.client.query(
            'INSERT INTO "MAYBE" ("UID1", "UID2") VALUES ($1, $2)',
            [currentUserId, user_id]
        );

        await db.client.query('COMMIT');

        res.status(200).json({ message: 'User added to Maybe list successfully' });
    } catch (err) {
        await db.client.query('ROLLBACK');
        console.error('Error adding user to Maybe list:', err);
        res.status(500).json({ error: 'Failed to add user to Maybe list' });
    }
};

const rewindUser = async (req, res) => {
pass
};

const getMaybeList = async (req, res) => {
    const { uid, __ } = req.params;

    try {
        const query = `
            SELECT 
                "users"."UID", 
                "users"."First_name", 
                "users"."Last_name", 
                "users"."position", 
                "users"."Main_image_id",
		"users"."Category_1_image_url",
                EXTRACT(YEAR FROM AGE("users"."DOB")) AS "Age"
            FROM "users"
            INNER JOIN "MAYBE" ON "users"."UID" = "MAYBE"."UID2"
            WHERE "MAYBE"."UID1" = $1
        `;

        const result = await db.client.query(query, [uid]);
        const maybeListUsers = result.rows;

	    if (maybeListUsers.length == 0) {
		res.status(200).json(maybeListUsers);
	    }
	    let i = 0;
	maybeListUsers.forEach(async (user) => {
		console.log(i)
		
		maybeListUsers[i].url1 = user.Category_1_image_url;
		i = i + 1;

		if (i == maybeListUsers.length) {

        res.status(200).json(maybeListUsers);
		}

	})


    } catch (err) {
        console.error('Error fetching Maybe list:', err);
        res.status(500).json({ error: 'Failed to fetch Maybe list' });
    }
};

const getLikedList = async (req, res) => {
    const { uid, __ } = req.params;

    try {
        const query = `
            SELECT 
                "users"."UID", 
                "users"."First_name", 
                "users"."Last_name", 
                "users"."position", 
                "users"."Main_image_id",
		"users"."Category_1_image_url",
                EXTRACT(YEAR FROM AGE("users"."DOB")) AS "Age"
            FROM "users"
            INNER JOIN "LIKES" ON "users"."UID" = "LIKES"."UID1"
            WHERE "LIKES"."UID2" = $1
        `;

        const result = await db.client.query(query, [uid]);
        const likedListUsers = result.rows;

	    if (likedListUsers.length == 0) {
		res.status(200).json(likedListUsers);
	    }
	    let i = 0;
	likedListUsers.forEach(async (user) => {
		console.log(i)
		
		likedListUsers[i].url1 = user.Category_1_image_url;
		i = i + 1;

		if (i == likedListUsers.length) {

        res.status(200).json(likedListUsers);
		}
	})
    } catch (err) {
        console.error('Error fetching liked list:', err);
        res.status(500).json({ error: 'Failed to fetch liked list' });
    }
};

const getMatchedList = async (req, res) => {
    const { uid, __ } = req.params;

    try {
        const query = `
            SELECT 
                "users"."UID", 
                "users"."First_name", 
                "users"."Last_name", 
                "users"."position", 
                "users"."Main_image_id",
                EXTRACT(YEAR FROM AGE("users"."DOB")) AS "Age"
            FROM "users"
            INNER JOIN "MATCHED" ON "users"."UID" = "MATCHED"."UID1"
            WHERE "MATCHED"."UID2" = $1
            OR "MATCHED"."UID1" = $1
        `;

        const result = await db.client.query(query, [uid]);
        const matchedListUsers = result.rows;

        res.status(200).json(matchedListUsers);
    } catch (err) {
        console.error('Error fetching matched list:', err);
        res.status(500).json({ error: 'Failed to fetch matched list' });
    }
};

const removeFromMaybe = async (req, res) => {
    const { _____, uid1, uid2 } = req.params;

    try {
        const query = `
	DELETE FROM "MAYBE"
	WHERE ("UID1" = $1 AND "UID2" = $2)
        `;

        const result = await db.client.query(query, [uid1, uid2]);

        res.status(200).json({message: "User Successfully unmaybed"});
    } catch (err) {
        console.error('Error to unmaybe:', err);
        res.status(500).json({ error: 'Failed to unmaybe' });
    }
}

module.exports = {
    getUserCards,
	getUserDetails,
    likeUser,
    dislikeUser,
    addUserToMaybeList,
    rewindUser,
    getMaybeList, 
    getLikedList,
    getMatchedList,
	removeFromMaybe

};
