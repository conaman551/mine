const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const imagesController = require('../controllers/imagesController');
const userRepo = require('../repository/userRepo');
const { passport } = require('../config/passport-config');
const { queryDatabase } = require("../repository/db");


// Set up storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('b')
    const uploadPath = path.join(__dirname, 'cat_images');
    if (!fs.existsSync(uploadPath)) {
      console.log('c')
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { //Reject any file larger than 10 MBytes
      fileSize: 10000000
  } });

router.put("/update_category/:cat_id/", upload.single('image'),passport.authenticate('jwt', { session: false }), async (req, res) => {

  if(!req.file){
    return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
}   
const user = await userRepo.getUserByEmail(req.user.email);
    if (!user) {
        return res.status(400).json({ error: 'User not exist' });
    }

const filetypes = /jpeg|jpg|png|gif|tiff/;
if (!filetypes.test(path.extname(req.file.originalname).toLowerCase()) && !/image/.test(req.file.mimetype)) {
return res.status(415).json({message: "Incorrect Image type, please use format", messageType:"InputError"})
}
const { ___, cat_id } = req.params;
const { categoryName } = req.body;

console.log('a')
const string_cat_id = 'Category_'+cat_id.toString()+'_image_url';
const string_cat_name = 'Category_'+cat_id.toString()+'_id';
console.log('user[string_cat_id]',user[string_cat_id])
console.log(string_cat_id)
console.log(string_cat_name)
// Delete old image if it exists
if (user[string_cat_id]) {
  try {
const fileName = user[string_cat_id].split('/').pop();
const oldImagePath = path.join(__dirname,'cat_images',fileName);
console.log('oldimagepath',oldImagePath)
if (fs.existsSync(oldImagePath)) {
  fs.unlinkSync(oldImagePath);
}
} 
catch {
  console.log('err5')
}
} 

  const imageUrl = `https://trippr.org:3000/images/cat_images/${req.file.filename}`;
    await queryDatabase(
          `UPDATE "users"
          SET "${string_cat_id}"=$1, "${string_cat_name}"=$3
          WHERE "email"=$2
          RETURNING *`, [imageUrl, user.email, categoryName]
        );

  // Respond with the file URL
  res.json({ message: 'File uploaded successfully', fileUrl: imageUrl });
});

// Serve static files from the uploads directory
router.use('/cat_images', express.static(path.join(__dirname, 'cat_images')));

  // Upload endpoint
  router.put('/update_main', upload.single('image'), async (req, res) => {
   
  });
  



module.exports = router;
