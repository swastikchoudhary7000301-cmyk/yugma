const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getConversations = async (req, res) => {
  try {
    const conversations =
      await Conversation.find({
        participants: req.user.id,
      })
        .populate(
          "participants",
          "name profilePicture headline isOnline lastSeen"
        )
        .populate(
          "lastMessage",
          "text image sender createdAt"
        )
        .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load conversations",
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (
      String(receiverId) ===
      String(req.user.id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot create a conversation with yourself",
      });
    }

    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [
            req.user.id,
            receiverId,
          ],
        },
      }).populate(
        "participants",
        "name profilePicture headline isOnline lastSeen"
      );

    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            req.user.id,
            receiverId,
          ],
        });

      conversation =
        await Conversation.findById(
          conversation._id
        ).populate(
          "participants",
          "name profilePicture headline isOnline lastSeen"
        );
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create conversation",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId =
      req.params.conversationId;

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id,
      });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    const messages =
      await Message.find({
        conversation: conversationId,
      })
        .populate(
          "sender",
          "name profilePicture"
        )
        .populate(
          "receiver",
          "name profilePicture"
        )
        .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      receiverId,
      text,
      image,
    } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (
      !text?.trim() &&
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id,
      });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    const message =
      await Message.create({
        conversation: conversationId,
        sender: req.user.id,
        receiver: receiverId,
        text: text?.trim() || "",
        image: image || "",
      });

    conversation.lastMessage =
      message._id;

    await conversation.save();

    const populatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "name profilePicture"
        )
        .populate(
          "receiver",
          "name profilePicture"
        );

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send message",
    });
  }
};

const markMessagesAsRead = async (
  req,
  res
) => {
  try {
    const conversationId =
      req.params.conversationId;

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id,
      });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user.id,
        read: false,
      },
      {
        read: true,
      }
    );

    return res.json({
      success: true,
      message:
        "Messages marked as read",
    });
  } catch (error) {
    console.error(
      "Mark messages read error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to mark messages as read",
    });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};