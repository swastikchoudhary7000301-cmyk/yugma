const express = require("express");

const {
  sendConnectionRequest,
  getPendingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  getSuggestions,
} = require("../controllers/connectioncontroller");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/request",
  protect,
  sendConnectionRequest
);

router.get(
  "/requests",
  protect,
  getPendingRequests
);

router.put(
  "/requests/:connectionId/accept",
  protect,
  acceptConnectionRequest
);

router.put(
  "/requests/:connectionId/reject",
  protect,
  rejectConnectionRequest
);

router.get(
  "/my",
  protect,
  getMyConnections
);

router.get(
  "/suggestions",
  protect,
  getSuggestions
);

module.exports = router;