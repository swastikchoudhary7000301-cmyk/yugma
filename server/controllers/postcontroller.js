const Post = require("../models/Post");
const User = require("../models/user");
const Notification = require("../models/Notification");

const populatePost = (query) => {
  return query
    .populate(
      "author",
      "name email profilePicture headline location"
    )
    .populate(
      "comments.user",
      "name profilePicture headline"
    )
    .populate(
      "comments.replies.user",
      "name profilePicture headline"
    );
};

const getPosts = async (req, res) => {
  try {
    const posts = await populatePost(
      Post.find().sort({
        createdAt: -1,
      })
    );

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(
      "Get posts error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load posts",
    });
  }
};

const createPost = async (
  req,
  res
) => {
  try {
    const {
      content,
      image,
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Post content is required",
      });
    }

    const post = await Post.create({
      author: req.user.id,
      content: content.trim(),
      image: image || "",
    });

    const populatedPost =
      await populatePost(
        Post.findById(post._id)
      );

    res.status(201).json({
      success: true,
      message:
        "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error(
      "Create post error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create post",
    });
  }
};

const toggleLike = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId =
      String(req.user.id);

    const index =
      post.likes.findIndex(
        (id) =>
          String(id) === userId
      );

    let liked;

    if (index >= 0) {
      post.likes.splice(index, 1);
      liked = false;
    } else {
      post.likes.push(req.user.id);
      liked = true;

      if (
        String(post.author) !== userId
      ) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: "like",
          message:
            "liked your post",
          relatedId: post._id,
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      liked,
      likes: post.likes.length,
    });
  } catch (error) {
    console.error(
      "Like error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update like",
    });
  }
};

const addComment = async (
  req,
  res
) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Comment cannot be empty",
      });
    }

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await post.save();

    if (
      String(post.author) !==
      String(req.user.id)
    ) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: "comment",
        message:
          "commented on your post",
        relatedId: post._id,
      });
    }

    const updated =
      await populatePost(
        Post.findById(post._id)
      );

    res.status(201).json({
      success: true,
      post: updated,
    });
  } catch (error) {
    console.error(
      "Comment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add comment",
    });
  }
};

const addReply = async (req, res) => {
  try {
    const { commentId, text } = req.body;
    if (!commentId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Comment and reply text are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.replies.push({ user: req.user.id, text: text.trim() });
    await post.save();

    const updated = await populatePost(Post.findById(post._id));
    res.status(201).json({ success: true, post: updated });
  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).json({ success: false, message: "Failed to add reply" });
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const userId = String(req.user.id);
    const index = comment.likes.findIndex((id) => String(id) === userId);
    let liked;
    if (index >= 0) { comment.likes.splice(index, 1); liked = false; }
    else { comment.likes.push(req.user.id); liked = true; }

    await post.save();
    res.json({ success: true, liked, likes: comment.likes.length });
  } catch (error) {
    console.error("Comment like error:", error);
    res.status(500).json({ success: false, message: "Failed to update comment like" });
  }
};

const toggleSave = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId =
      String(req.user.id);

    const index =
      post.savedBy.findIndex(
        (id) =>
          String(id) === userId
      );

    let saved;

    if (index >= 0) {
      post.savedBy.splice(index, 1);
      saved = false;
    } else {
      post.savedBy.push(req.user.id);
      saved = true;
    }

    await post.save();

    await User.findByIdAndUpdate(
      req.user.id,
      saved
        ? {
            $addToSet: {
              savedPosts: post._id,
            },
          }
        : {
            $pull: {
              savedPosts: post._id,
            },
          }
    );

    res.json({
      success: true,
      saved,
    });
  } catch (error) {
    console.error(
      "Save error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to save post",
    });
  }
};

const getSavedPosts = async (
  req,
  res
) => {
  try {
    const posts =
      await Post.find({
        savedBy: req.user.id,
      })
        .populate(
          "author",
          "name email profilePicture headline"
        )
        .populate(
          "comments.user",
          "name profilePicture"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(
      "Saved posts error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get saved posts",
    });
  }
};

const deletePost = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (
      String(post.author) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own posts",
      });
    }

    await post.deleteOne();

    await User.updateMany(
      {},
      {
        $pull: {
          savedPosts: post._id,
        },
      }
    );

    res.json({
      success: true,
      message:
        "Post deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete post",
    });
  }
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  addReply,
  toggleCommentLike,
  toggleSave,
  getSavedPosts,
  deletePost,
};