const express = require("express");

const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} = require("../controllers/chatController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/conversations",
  protect,
  getConversations
);

router.post(
  "/conversations",
  protect,
  createConversation
);

router.get(
  "/conversations/:conversationId/messages",
  protect,
  getMessages
);

router.put(
  "/conversations/:conversationId/read",
  protect,
  markMessagesAsRead
);

router.post(
  "/messages",
  protect,
  sendMessage
);

module.exports = router;