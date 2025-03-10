const express = require('express');
const router = express.Router();
const userSwipeController = require('../controllers/userSwipeController');

// Import handler functions
const userController = require('../controllers/userController');

router.post('/login', userController.login);

router.get('/:uid', userSwipeController.getUserDetails);

router.get('/:uid/cards', userSwipeController.getUserCards);

router.post('/:user_id/like/:target_user_id', userSwipeController.likeUser);

router.post('/:user_id/dislike/:target_user_id', userSwipeController.dislikeUser);

router.post('/:user_id/maybe', userSwipeController.addUserToMaybeList);

router.post('/:user_id/maybe/:target_user_id', userSwipeController.addUserToMaybeList);

router.get('/:uid/liked-list', userSwipeController.getLikedList);

router.get('/:uid/matched-list', userSwipeController.getMatchedList);

router.get('/:uid/maybe-list', userSwipeController.getMaybeList);

router.put('/unmaybe/:uid1/:uid2', userSwipeController.removeFromMaybe);


// Submit gender endpoint
//router.post('/create-user', userController.createUser);
router.put('/submit-gender', userController.submitGender);
router.put('/submit-name', userController.submitName);
router.put('/submit-password', userController.submitPassword);
router.put('/submit-dob', userController.submitDob)
router.put('/submit-preference', userController.submitPreference);
router.put('/submit-address', userController.submitAddress);
router.put('/submit-number', userController.submitNumber);
router.put('/submit-email', userController.sendEmail);
router.post('/check-code', userController.checkCode);
router.put('/submit-bio', userController.submitBio);
router.put('/submit-preferences', userController.submitPreferences);
router.put('/submit-user', userController.submitUser);
router.get('/:uid/get-user', userController.sendVariables);
router.get('/delete/:uid', userController.deleteUser);

module.exports = router;
