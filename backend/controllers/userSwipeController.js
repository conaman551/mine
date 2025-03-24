const db = require('../database_connector/databaseConnection');
const { queryDatabase } = require('../repository/db');
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


const getUserCards = async (req, res) => {
    try {
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const currentUserId = user.UID;
        const posit = user.position;
        // Get the current user's filters
        const filterQuery = `SELECT * FROM "ACTIVE_FILTERS" WHERE "UID" = $1 LIMIT 1`;
        const filterResult = await queryDatabase(filterQuery, [currentUserId]);
        let userFilters = filterResult[0];
        console.log('filters',userFilters)

        if (!userFilters) {
           userFilters = {Minimum_age:18, Maximum_age:100, Minimum_distance:0, Maximum_distance:5000, Preference:'distance'}
        }
        
        const { Minimum_age, Maximum_age, Minimum_distance, Maximum_distance, Preference } = userFilters;
       
        // Get potential matching users
        const potentialUsersQuery = `
            SELECT 
                "UID", 
                "First_name", 
                "Last_name", 
                "position",  
                EXTRACT(YEAR FROM AGE("DOB")) AS age, 
                "Gender", 
                "Gender_pref",
                "Category_1_image_url",
                "Category_2_image_url",
                "Category_3_image_url",
                "Category_4_image_url",
                "Category_1_id", 
                "Category_2_id", 
                "Category_3_id", 
                "Category_4_id",
                "Bio"
            FROM "users"
            WHERE "UID" != $1
            AND EXTRACT(YEAR FROM AGE("DOB")) BETWEEN $2 AND $3
            AND "Gender" = $4
            AND "Gender_pref" = $5
            AND "position" IS NOT NULL  -- Ensure position exists for distance calculation
        `;
        const potentialUsersResult = await queryDatabase(potentialUsersQuery, [
            currentUserId,
            Minimum_age,
            Maximum_age,
            user.Gender_pref,
            user.Gender
        ]);
        let potentialUsers = potentialUsersResult;
        console.log('potential users',potentialUsers)
        // Get interacted users
        const interactedUsersQuery = `
            SELECT "UID2" AS uid FROM "MATCHED" WHERE "UID1" = $1
            UNION
            SELECT "UID1" AS uid FROM "MATCHED" WHERE "UID2" = $1
            UNION
            SELECT "UID2" AS uid FROM "LIKES" WHERE "UID1" = $1
            UNION
            SELECT "UID2" AS uid FROM "MAYBE" WHERE "UID1" = $1
            UNION
            SELECT "UID2" AS uid FROM "REJECTS" WHERE "UID1" = $1
        `;
        const interactedUsersResult = await queryDatabase(interactedUsersQuery, [currentUserId]);
        const interactedUserIds = interactedUsersResult.map(row => row.uid);

        // Filter out interacted users
        potentialUsers = potentialUsers.filter(user => !interactedUserIds.includes(user.UID));

        // Calculate distances and filter by distance
        potentialUsers = potentialUsers.map(user => {
                const distance = calculateDistance(posit, user.position); // Using Haversine formula
                console.log('distance',distance)
                return {
                    ...user,
                    distance: distance.toFixed(2), // Distance in kilometers, rounded to 2 decimals
                    url1: user.Category_1_image_url,
                    url2: user.Category_2_image_url,
                    url3: user.Category_3_image_url,
                    url4: user.Category_4_image_url
                };
            }).filter(user => user.distance >= Minimum_distance && user.distance <= Maximum_distance);

        // Sort based on preference
        if (Preference === 'distance') {
            potentialUsers.sort((a, b) => Number(a.distance) - Number(b.distance)); // Sort by shortest distance
        } else if (Preference === 'age') {
            potentialUsers.sort((a, b) => a.age - b.age); // Sort by youngest first
        }
        console.log('filtered potential users',potentialUsers)
        // Send response
        res.status(200).json(potentialUsers);

    } catch (err) {
        console.error('Error in getUserCards:', err);
        res.status(500).json({ error: 'Failed to retrieve user cards' });
    }
};

const likeUser = async (req, res) => {
    const {target_user_id} = req.body;
    const user_id = target_user_id;
    const user = await getUserByEmail(req.user.email);
        if (!user || !user_id) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const currentUserId = user.UID;
    try {
	    let type = "liked";
        await queryDatabase('BEGIN');

        await queryDatabase(
            'INSERT INTO "LIKES" ("UID1", "UID2", "Time_liked") VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [currentUserId, user_id]
        );

        const checkIfMaybeList = await queryDatabase(
            'SELECT * FROM "MAYBE" WHERE "UID1" = $1 AND "UID2" = $2',
            [currentUserId, user_id] 
        );
        
        if (checkIfMaybeList.length > 0) {
            await queryDatabase(
                'DELETE FROM "MAYBE" WHERE "UID1" = $1 AND "UID2" = $2',
                [currentUserId, user_id] 
            );
        }

        // Check if the liked user also likes the current user
        const result = await queryDatabase(
            'SELECT * FROM "LIKES" WHERE "UID1" = $1 AND "UID2" = $2',
            [user_id, currentUserId]
        );

        if (result.length > 0) {
            // Mutual like found
            await queryDatabase(
                'INSERT INTO "MATCHED" ("UID1", "UID2", "Time_matched") VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [currentUserId, user_id]
            );

            await queryDatabase(
                'INSERT INTO "CHAT" ("UID1", "UID2", "Time_started") VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [currentUserId, user_id]
            );

            //  Clean likes table
            await queryDatabase(
                'DELETE FROM "LIKES" WHERE ("UID1" = $1 AND "UID2" = $2) OR ("UID1" = $2 AND "UID2" = $1)',
                [currentUserId, user_id]
            );
		type = "matched";
		console.log("user was matched");
        }

        // Commit transaction
        await queryDatabase('COMMIT');

        res.status(200).json({ message: 'User liked successfully', type: type });
    } catch (err) {
        // Rollback transaction on error
        await queryDatabase('ROLLBACK');
        console.error('Error liking user:', err);
        res.status(500).json({ error: 'Failed to like user' });
    }
};





const dislikeUser = async (req, res) => {
    const {target_user_id} = req.body;
    const user_id = target_user_id;
    const user = await getUserByEmail(req.user.email);
        if (!user || !user_id) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const currentUserId = user.UID;
    try {
        await queryDatabase('BEGIN');

        await queryDatabase(
            'INSERT INTO "REJECTS" ("UID1", "UID2", "Date_rejected") VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [currentUserId, user_id]
        );

        await queryDatabase(
            'DELETE FROM "LIKES" WHERE ("UID1" = $1 AND "UID2" = $2) OR ("UID2" = $1 AND "UID1" = $2)',
            [currentUserId, user_id]
        );


        await queryDatabase('COMMIT');

        res.status(200).json({ message: 'User disliked successfully' });
    } catch (err) {
        await queryDatabase('ROLLBACK');
        console.error('Error disliking user:', err);
        res.status(500).json({ error: 'Failed to dislike user' });
    }
};

const addUserToMaybeList = async (req, res) => {
    const {target_user_id} = req.body;
    const user_id = target_user_id;
    const user = await getUserByEmail(req.user.email);
        if (!user || !user_id) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const currentUserId = user.UID;
    try {
        await queryDatabase('BEGIN');

        const result = await queryDatabase(
            'SELECT COUNT(*) FROM "MAYBE" WHERE "UID1" = $1',
            [currentUserId]
        );
        const count = parseInt(result[0].count, 10);

        if (count >= 5) {
            res.status(400).json({ message: 'Maybe list is full' });
            await queryDatabase('ROLLBACK');
            return;
        }

        await queryDatabase(
            'INSERT INTO "MAYBE" ("UID1", "UID2") VALUES ($1, $2)',
            [currentUserId, user_id]
        );

        await queryDatabase('COMMIT');

        res.status(200).json({ message: 'User added to Maybe list successfully' });
    } catch (err) {
        await queryDatabase('ROLLBACK');
        console.error('Error adding user to Maybe list:', err);
        res.status(500).json({ error: 'Failed to add user to Maybe list' });
    }
};

const rewindUser = async (req, res) => {
pass
};

const getMaybeList = async (req, res) => {
    const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const uid = user.UID;
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

        const result = await queryDatabase(query, [uid]);
        const maybeListUsers = result;

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
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    const uid = user.UID;
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

        const result = await queryDatabase(query, [uid]);
        const likedListUsers = result;

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
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    const uid = user.UID;
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

        const result = await queryDatabase(query, [uid]);
        const matchedListUsers = result;

        res.status(200).json(matchedListUsers);
    } catch (err) {
        console.error('Error fetching matched list:', err);
        res.status(500).json({ error: 'Failed to fetch matched list' });
    }
};

const removeFromMaybe = async (req, res) => {
    const {target_user_id} = req.body;
    const uid2 = target_user_id;
    const user = await getUserByEmail(req.user.email);
        if (!user || !uid2) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        const uid1 = user.UID;
    try {
        const query = `
	DELETE FROM "MAYBE"
	WHERE ("UID1" = $1 AND "UID2" = $2)
        `;

        const result = await queryDatabase(query, [uid1, uid2]);

        res.status(200).json({message: "User Successfully unmaybed"});
    } catch (err) {
        console.error('Error to unmaybe:', err);
        res.status(500).json({ error: 'Failed to unmaybe' });
    }
}

module.exports = {
    getUserCards,
    likeUser,
    dislikeUser,
    addUserToMaybeList,
    rewindUser,
    getMaybeList, 
    getLikedList,
    getMatchedList,
	removeFromMaybe

};
