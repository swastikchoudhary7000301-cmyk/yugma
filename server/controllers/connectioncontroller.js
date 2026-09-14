const Connection = require("../models/Connection");
const User = require("../models/user");
const Notification = require("../models/Notification");

const sendConnectionRequest = async (
  req,
  res
) => {
  try {
    const requester = req.user.id;
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: "Recipient is required",
      });
    }

    if (String(requester) === String(recipient)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot connect with yourself",
      });
    }

    const recipientUser =
      await User.findById(recipient);

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existing =
      await Connection.findOne({
        $or: [
          {
            requester,
            recipient,
          },
          {
            requester: recipient,
            recipient: requester,
          },
        ],
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          `Connection already exists with status: ${existing.status}`,
      });
    }

    const connection =
      await Connection.create({
        requester,
        recipient,
        status: "pending",
      });

    await Notification.create({
      recipient,
      sender: requester,
      type: "connection",
      message:
        "sent you a connection request",
      relatedId: connection._id,
    });

    const populated =
      await Connection.findById(
        connection._id
      )
        .populate(
          "requester",
          "name email profilePicture headline location"
        )
        .populate(
          "recipient",
          "name email profilePicture headline location"
        );

    res.status(201).json({
      success: true,
      message:
        "Connection request sent",
      connection: populated,
    });
  } catch (error) {
    console.error(
      "Send connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to send connection request",
    });
  }
};

const getPendingRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await Connection.find({
        recipient: req.user.id,
        status: "pending",
      })
        .populate(
          "requester",
          "name email profilePicture headline location"
        )
        .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(
      "Get requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get connection requests",
    });
  }
};

const acceptConnectionRequest = async (
  req,
  res
) => {
  try {
    const connection =
      await Connection.findById(
        req.params.connectionId
      );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message:
          "Connection request not found",
      });
    }

    if (
      String(connection.recipient) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    connection.status = "accepted";
    await connection.save();

    await User.findByIdAndUpdate(
      connection.requester,
      {
        $inc: {
          connectionsCount: 1,
        },
      }
    );

    await User.findByIdAndUpdate(
      connection.recipient,
      {
        $inc: {
          connectionsCount: 1,
        },
      }
    );

    await Notification.create({
      recipient: connection.requester,
      sender: req.user.id,
      type: "connection",
      message:
        "accepted your connection request",
      relatedId: connection._id,
    });

    res.json({
      success: true,
      message:
        "Connection accepted",
      connection,
    });
  } catch (error) {
    console.error(
      "Accept connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to accept connection",
    });
  }
};

const rejectConnectionRequest = async (
  req,
  res
) => {
  try {
    const connection =
      await Connection.findById(
        req.params.connectionId
      );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message:
          "Connection request not found",
      });
    }

    if (
      String(connection.recipient) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    connection.status = "rejected";

    await connection.save();

    res.json({
      success: true,
      message:
        "Connection request rejected",
    });
  } catch (error) {
    console.error(
      "Reject connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reject connection",
    });
  }
};

const getMyConnections = async (
  req,
  res
) => {
  try {
    const connections =
      await Connection.find({
        status: "accepted",
        $or: [
          {
            requester: req.user.id,
          },
          {
            recipient: req.user.id,
          },
        ],
      })
        .populate(
          "requester",
          "name email profilePicture headline location"
        )
        .populate(
          "recipient",
          "name email profilePicture headline location"
        )
        .sort({ updatedAt: -1 });

    const users = connections.map(
      (connection) => {
        if (
          String(connection.requester._id) ===
          String(req.user.id)
        ) {
          return connection.recipient;
        }

        return connection.requester;
      }
    );

    res.json(users);
  } catch (error) {
    console.error(
      "Get connections error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get connections",
    });
  }
};

const getSuggestions = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const existing =
      await Connection.find({
        $or: [
          {
            requester: userId,
          },
          {
            recipient: userId,
          },
        ],
      });

    const excludedIds = [
      userId,
      ...existing.map((item) =>
        String(
          item.requester === userId
            ? item.recipient
            : item.requester
        )
      ),
    ];

    const users =
      await User.find({
        _id: {
          $nin: excludedIds,
        },
      })
        .select(
          "name email profilePicture headline location skills"
        )
        .limit(10);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Suggestions error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get suggestions",
    });
  }
};

module.exports = {
  sendConnectionRequest,
  getPendingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  getSuggestions,
};