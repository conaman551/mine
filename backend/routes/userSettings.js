const express = require("express");
const router = express.Router();

const userSettingsController = require('../controllers/userSettingsController.js');


// All userSettingsController endpoints defined here
router.put('/image/:user_id', userSettingsController.updateImage);
router.put('/category/:user_id', userSettingsController.updateCategory);
router.put('/smoking/:user_id', userSettingsController.updateSmoking);
router.put('/drinking/:user_id', userSettingsController.updateDrinking);
router.put('/bio/:user_id', userSettingsController.updateBio);
router.put('/location/:user_id', userSettingsController.updateLocation);
router.put('/genderPref/:user_id', userSettingsController.updateGenderPref);
router.put('/gender/:user_id', userSettingsController.updateGender);

module.exports = router;
