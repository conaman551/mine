const { response } = require('express');
const db = require('../database_connector/databaseConnection');
const { getUserByEmail } = require('../repository/userRepo');

const updateImage = async (req, res) => {
    const {image, number} = req.body;
    const currentUserId = req.params.user_id; 
    const fieldUpdate = "Category_" + number + "_image_url";
    try{
        const query = `
        UPDATE "users" 
        SET "${fieldUpdate}" = $1
        WHERE "UID" = $2
        RETURNING *`;
            const values = [image, currentUserId]
            const result = await db.client.query(query, values);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Image not found' });
            }

    } catch (err){
        console.error('Error updating Image:', err);
        res.status(500).json({ error: 'Failed to update Image' });
    }
}; 




const updateCategory = async (req, res) => {
    const {tagNumber, number} = req.body;
    const currentUserId = req.params.user_id; 
    const fieldUpdate = "Category_" + number + "_id";
    try{
        const query = `
        UPDATE "users" 
        SET "${fieldUpdate}" = $1
        WHERE "UID" = $2
        RETURNING *`;
            const values = [tagNumber, currentUserId]
            const result = await db.client.query(query, values);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'category not found' });
            }

    } catch (err){
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

const updateSmoking = async (req, res) => {
    const {value} = req.body;
    const currentUserId = req.params.user_id; 
    try{
        const query = `
        UPDATE "users" 
        SET "Smoking_tag" = $1
        WHERE "UID" = $2
        RETURNING *`;
        const values = [value, currentUserId]
            const result = await db.client.query(query, values);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'tag not found' });
            }

    } catch (err){
        console.error('Error updating tag:', err);
        res.status(500).json({ error: 'Failed to update tag' });
    }
};

const updateDrinking = async (req, res) => {
    const {value} = req.body;
    const currentUserId = req.params.user_id; 
    try{
        const query = `
        UPDATE "users" 
        SET "Drinking_tag" = $1
        WHERE "UID" = $2
        RETURNING *`;
        const values = [value, currentUserId]
            const result = await db.client.query(query, values);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'tag not found' });
            }

    } catch (err){
        console.error('Error updating tag:', err);
        res.status(500).json({ error: 'Failed to update tag' });
    }
};

const updateBio = async (req, res) => {
    const {newBio} = req.body;
    const currentUserId = req.params.user_id; 
    try{
        const query = `
        UPDATE "users" 
        SET "Bio" = $1
        WHERE "UID" = $2
        RETURNING *`;
            const result = await db.client.query(query,[newBio, currentUserId]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'bio not found' });
            }

    } catch (err){
        console.error('Error updating bio:', err);
        res.status(500).json({ error: 'Failed to update bio' });
    }
};

const updateLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    const positionString = `(${latitude}, ${longitude})`;
    console.log('position str',positionString);
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        // Update database
       await db.client.query(
        `UPDATE "users"
        SET "position"=$1
        WHERE "email"=$2`
            ,[positionString,user.email])

        // Respond with success message
        return res.json({ message: 'Address successfully updated' });
    } catch (error) {
        // Respond with error message
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateGender = async (req, res) => {
    const {newGender} = req.body;
    const currentUserId = req.params.user_id; 
    try{
        const query = `
        UPDATE "users" 
        SET "Gender" = $1
        WHERE "UID" = $2
        RETURNING *`;
            const result = await db.client.query(query,[newGender, currentUserId]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'gender not found' });
            }

    } catch (err){
        console.error('Error updating gender:', err);
        res.status(500).json({ error: 'Failed to update gender' });
    }
};

const updateGenderPref = async (req, res) => {
    const {newGenderPref} = req.body;
    const currentUserId = req.params.user_id; 
    try{
        const query = `
        UPDATE "users" 
        SET "Gender_pref" = $1
        WHERE "UID" = $2
        RETURNING *`;
            const result = await db.client.query(query,[newGenderPref, currentUserId]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'genderPref not found' });
            }

    } catch (err){
        console.error('Error updating gender:', err);
        res.status(500).json({ error: 'Failed to update genderPref' });
    }
};

module.exports = {
    updateImage,
    updateCategory,
    updateBio,
    updateGenderPref,
    updateGender,
    updateLocation,
    updateSmoking,
    updateDrinking
}