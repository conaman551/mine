const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const imagesController = require('../controllers/imagesController');
const userRepo = require('../repository/userRepo')

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('b')
      const uploadPath = path.join(__dirname, 'profile_images');
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
  
  // Upload endpoint
  router.put('/update_main', upload.single('image'), async (req, res) => {
    const { data, filename, uid } = req.body;
     if(!data || !filename || !uid){
            return  res.status(400).json({message:"Malformed Request", messageType:"JSONError"});
        }   
    
    console.log('a')
    //Probably have to send up email from frontend
    const user = await userRepo.getUserByUserId(uid)
    if (!user) {
        return res.status(404).json({message:"User does not exist", messageType:"ValueError"});
    }
    // Delete old image if it exists
  if (user.Main_image_url) {
    const oldImagePath = path.join(__dirname,'profile_images', user.Main_image_url);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
   // addProfileImage(user.userid,req.file.filename)
   imagesController.updateMain(req.file.filename,uid)
    // Construct the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/images/profile_images/${req.file.filename}`;
    console.log('file url',fileUrl);
    // Respond with the file URL
    res.json({ message: 'File uploaded successfully', fileUrl: fileUrl });
  });
  
  // Serve static files from the uploads directory
  router.use('/profile_images', express.static(path.join(__dirname, 'profile_images')));


//router.get("/:uid", imagesController.getProfileByUID);
//router.get("/:uid", imagesController.getCategoryByUID);
router.put("/update_category/:cat_id/", imagesController.updateCategory);
//router.put("/update_main/", imagesController.updateMain);




module.exports = router;
