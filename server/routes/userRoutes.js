const express = require("express");

const {
  getMyProfile,
  getUserProfile,
  updateProfile,
  searchUsers,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.get(
  "/search",
  protect,
  searchUsers
);

router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;