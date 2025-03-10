const express = require("express");
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get("/:uid", chatController.getChatListByUid)
router.get("/blocked/:uid1", chatController.blockedUsers);
router.get("/reports/:uid1/", chatController.reportsUser)
router.get("/reported/:uid1/", chatController.reportedUser)
router.get("/messages/:chatid", chatController.getMessagesByChatId)
router.post("/send_message/:chatid/", chatController.sendMessage)
router.put("/:uid/:chatid/read", chatController.updateReadStatus)
router.delete("/unmatch/:uid1/:uid2", chatController.unmatch)
router.post("/report/:uid1/:uid2", chatController.reportUser)
router.post("/block/:uid1/:uid2", chatController.blockUser)


module.exports = router;
