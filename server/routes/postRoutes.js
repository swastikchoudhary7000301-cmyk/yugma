const express = require("express");

const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  addReply,
  toggleCommentLike,
  toggleSave,
  getSavedPosts,
  deletePost,
} = require("../controllers/postcontroller");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getPosts
);

router.post(
  "/",
  protect,
  createPost
);

router.get(
  "/saved",
  protect,
  getSavedPosts
);

router.put(
  "/:id/like",
  protect,
  toggleLike
);

router.post(
  "/:id/comments",
  protect,
  addComment
);

router.post(
  "/:id/replies",
  protect,
  addReply
);

router.put(
  "/:id/comment-like",
  protect,
  toggleCommentLike
);

router.put(
  "/:id/save",
  protect,
  toggleSave
);

router.delete(
  "/:id",
  protect,
  deletePost
);

module.exports = router;