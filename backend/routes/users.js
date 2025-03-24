const express = require('express');
const router = express.Router();
const userSwipeController = require('../controllers/userSwipeController');
const { passport } = require('../config/passport-config');
// Import handler functions
const userController = require('../controllers/userController');
const { getUserByEmail } = require('../repository/userRepo');

router.post('/login', userController.login);

//router.get('/:uid', userSwipeController.getUserDetails);

router.get('/get-cards',passport.authenticate('jwt', { session: false }),userSwipeController.getUserCards);

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
router.put('/submit-gender', passport.authenticate('jwt', { session: false }),userController.submitGender);

router.put('/submit-password',userController.submitPassword);

router.put('/submit-preference', passport.authenticate('jwt', { session: false }),userController.submitPreference);
router.put('/submit-cats', passport.authenticate('jwt', { session: false }),userController.submitCats);
router.put('/submit-address',  passport.authenticate('jwt', { session: false }),userController.submitAddress);
router.put('/submit-number', userController.submitNumber);
router.put('/submit-email', userController.sendEmail);
router.post('/check-code', userController.checkCode);
router.put('/submit-bio',  passport.authenticate('jwt', { session: false }),userController.submitBio);
router.put('/submit-preferences', passport.authenticate('jwt', { session: false }), userController.submitPreferences);
router.put('/submit-user', passport.authenticate('jwt', { session: false }), userController.submitUser);

router.get('/delete/:uid', userController.deleteUser);

router.put('/submit-name', passport.authenticate('jwt', { session: false }), userController.submitName);

router.put('/submit-dob',passport.authenticate('jwt', { session: false }),userController.submitDob);

router.get('/get-user', passport.authenticate('jwt', { session: false }), async (req, res) => {

    let currUser = await getUserByEmail(req.user.email);
    if (!currUser) {
      return  res.status(400).json({message:"User does not exist", messageType:"user error"});
    }
  
    return res.json(currUser);
  })

module.exports = router;
