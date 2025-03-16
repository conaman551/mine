const db = require('../database_connector/databaseConnection');

const updateMain = async (filename,uid) => {
	//const { data, filename, uid } = req.body;
	try {
		const result = await db.client.query(
			`UPDATE "users"
			SET "Main_image_url"=$1
			WHERE "UID"=$2
			RETURNING *`, [filename, uid]
		);
		res.status(201).json(result.rows);


      // Store image here
     

	} catch (err) {
		console.error('Error uploading main image for user', err);
		res.status(500).json({ error: 'Failed to upload main image' });

	}
}

const updateCategory = async (req, res) => {
    const { ___, cat_id } = req.params;
	const { data, filename, uid, categoryName } = req.body;
	const string_cat_id = 'Category_'+cat_id.toString()+'_image_url';
	const string_cat_name = 'Category_'+cat_id.toString()+'_id';
	console.log("updating category on backend....");

	try {
		const result = await db.client.query(
			`UPDATE "users"
			SET "${string_cat_id}"=$1, "${string_cat_name}"=$3
			WHERE "UID"=$2
			RETURNING *`, [filename, uid, categoryName]
		);
		res.status(201).json(result.rows);

		    const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
    		const buffer = Buffer.from(base64Data, 'base64');

          // Store Image data here
	} catch (err) {
		console.error('Error uploading main image for user', err);
		res.status(500).json({ error: 'Failed to upload main image' });

	}
}


module.exports = {
	//getProfileByUID,
	//getCategoryByUID,
	updateCategory,
	updateMain
}

