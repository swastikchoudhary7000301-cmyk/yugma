require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("user-online", (userId) => {
    if (!userId) return;

    onlineUsers.set(String(userId), socket.id);

    io.emit("user-status", {
      userId: String(userId),
      online: true,
    });

    console.log("🟢 User online:", userId);
  });

  socket.on("join-conversation", (conversationId) => {
    if (!conversationId) return;

    socket.join(String(conversationId));

    console.log(
      `💬 ${socket.id} joined conversation ${conversationId}`
    );
  });

  socket.on("leave-conversation", (conversationId) => {
    if (!conversationId) return;

    socket.leave(String(conversationId));
  });

  socket.on("typing", ({ conversationId, userId }) => {
    if (!conversationId) return;

    socket.to(String(conversationId)).emit("user-typing", {
      userId,
    });
  });

  socket.on("stop-typing", ({ conversationId, userId }) => {
    if (!conversationId) return;

    socket.to(String(conversationId)).emit("user-stop-typing", {
      userId,
    });
  });

  socket.on("new-message", (message) => {
    if (!message?.conversation) return;

    socket
      .to(String(message.conversation))
      .emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    let disconnectedUser = null;

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUser) {
      io.emit("user-status", {
        userId: disconnectedUser,
        online: false,
      });

      console.log("🔴 User offline:", disconnectedUser);
    }

    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Yugma server running on http://localhost:${PORT}`);
});