import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import SeedRoutes from "./controllers/seed.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3005;
const BASE_URL = process.env.BASE_URL || "http://localhost";

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/audios", express.static("uploads/audios"));

app.use("/api/auth", AuthRoutes);
app.use("/api", SeedRoutes);
app.use("/api/messages", MessageRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server started on ${BASE_URL}:${PORT}`);
});
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    console.log("User connected: ", userId);
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
  socket.on("signout", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
  socket.on("disconnect", (data, f) => {
    // remove user from onlineUsers
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
    console.log("User disconnected: ", data);
    console.log(onlineUsers);
  });

  socket.on("msg-send", (msg) => {
    // console.log("New message: ", msg);
    const sendUserSocket = onlineUsers.get(msg.to);
    if (sendUserSocket) {
      // console.log("User is online Emitting message: " + sendUserSocket);
      socket.to(sendUserSocket).emit("msg-receive", {
        message: msg.message,
        from: msg.from,
      });
    }
  });
  //typing

  socket.on("typing", (data) =>
    socket.to(data.receiverId).emit("typing", {
      senderId: data.senderId,
    }),
  );
  socket.on("stopTyping", (data) =>
    socket.to(data.receiverId).emit("stopTyping"),
  );
  //seen message

  socket.on("seen-message", (msg) => {
    const sendUserSocket = onlineUsers.get(msg.to);
    if (sendUserSocket) {
      console.log("User is online Seen the message: " + sendUserSocket);
      socket.to(sendUserSocket).emit("seen-message-receive", {
        from: msg.from,
      });
    }
  });
  //delivered message

  socket.on("delivered-message", (msg) => {
    const sendUserSocket = onlineUsers.get(msg.to);
    if (sendUserSocket) {
      console.log("User is online Delivered the message: " + sendUserSocket);
      socket.to(sendUserSocket).emit("delivered-message-receive", {
        from: msg.from,
      });
    }
  });

  // seen all messages

  socket.on("seen-allMessages", (data) => {
    const sendUserSocket = onlineUsers.get(data.receiverId);
    if (sendUserSocket) {
      console.log("seen All message " + data.receiverId);
      socket.to(data.receiverId).emit("seen-allMessages-received", {
        to: data.receiverId,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    console.log("Received outgoing video call: ", data);
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log("Outgoing video call: ", data);
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", (data) => {
    console.log("Accept incoming call: ", data);
    const sendUserSocket = onlineUsers.get(data.id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });
});
