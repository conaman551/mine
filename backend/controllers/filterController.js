const db = require('../database_connector/databaseConnection');

const createFilter = async (req, res) => {
    const { maximumDistance, minimumDistance, maximumAge, minimumAge, preference, uid } = req.body;
    try {
        const query = `
            INSERT INTO "ACTIVE_FILTERS" ("Maximum_distance",  "Minimum_distance", "Maximum_age", "Minimum_age", "Preference", "UID")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [maximumDistance, minimumDistance, maximumAge, minimumAge, preference, uid];

        const result = await db.client.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating filter:', err);
        res.status(500).json({ error: 'Failed to create filter' });
    }
};

const getFilterById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.client.query('SELECT * FROM "ACTIVE_FILTERS" WHERE "Filter_id" = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Filter not found' });
        }
    } catch (err) {
        console.error('Error getting filter:', err);
        res.status(500).json({ error: 'Failed to get filter' });
    }
};

const getFiltersByUserId = async (req, res) => {
    const { uid } = req.params;

    try {
        const result = await db.client.query('SELECT * FROM "ACTIVE_FILTERS" WHERE "UID" = $1', [uid]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error getting filters:', err);
        res.status(500).json({ error: 'Failed to get filters' });
    }
};

const updateFilterById = async (req, res) => {
    const { id } = req.params;
    const { maximumDistance, minimumDistance, maximumAge, minimumAge, preference } = req.body;

    try {
        const query = `
            UPDATE "ACTIVE_FILTERS" 
            SET "Maximum_distance" = $1, "Minimum_distance" = $2, "Maximum_age" = $3, "Minimum_age" = $4, "Preference" = $5
            WHERE "Filter_id" = $6
            RETURNING *`;
        const values = [maximumDistance, minimumDistance, maximumAge, minimumAge, preference, id];

        const result = await db.client.query(query, values);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Filter not found' });
        }
    } catch (err) {
        console.error('Error updating filter:', err);
        res.status(500).json({ error: 'Failed to update filter' });
    }
};


const deleteFilterById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM "ACTIVE_FILTERS" WHERE "Filter_id" = $1 RETURNING *';
        const values = [id];

        const result = await db.client.query(query, values);
        if (result.rows.length > 0) {
            res.json({ message: 'Filter deleted successfully' });
        } else {
            res.status(404).json({ error: 'Filter not found' });
        }
    } catch (err) {
        console.error('Error deleting filter:', err);
        res.status(500).json({ error: 'Failed to delete filter' });
    }
};

module.exports = {
    createFilter,
    getFilterById,
    getFiltersByUserId,
    updateFilterById,
    deleteFilterById,
};