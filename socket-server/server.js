const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();

// ✅ IMPORTANT: Render uses PORT from environment
const PORT = process.env.PORT || 5000;

// Store waiting users and active calls
const waitingUsers = [];
const activeCalls = new Map();

/* =======================
   HEALTH CHECK (RENDER)
======================= */
// ⚠️ Render yahi hit karta hai
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Optional root route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SpeakFlow Socket Server is running!",
    waiting: waitingUsers.length,
    activeCalls: activeCalls.size / 2
  });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // later frontend URL laga sakte ho
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("find-match", (userData) => {
    const alreadyWaiting = waitingUsers.find(u => u.socketId === socket.id);
    if (alreadyWaiting || activeCalls.has(socket.id)) return;

    const partnerIndex = waitingUsers.findIndex(u => u.socketId !== socket.id);

    if (partnerIndex !== -1) {
      const partner = waitingUsers.splice(partnerIndex, 1)[0];

      const roomId = `room-${Date.now()}-${socket.id.slice(0,4)}-${partner.socketId.slice(0,4)}`;

      activeCalls.set(socket.id, {
        partnerId: partner.socketId,
        roomId,
        partnerName: partner.name,
      });

      activeCalls.set(partner.socketId, {
        partnerId: socket.id,
        roomId,
        partnerName: userData.name || "Anonymous",
      });

      socket.join(roomId);
      io.sockets.sockets.get(partner.socketId)?.join(roomId);

      socket.emit("matched", {
        roomId,
        partnerId: partner.socketId,
        partnerName: partner.name,
        isInitiator: true,
      });

      io.to(partner.socketId).emit("matched", {
        roomId,
        partnerId: socket.id,
        partnerName: userData.name || "Anonymous",
        isInitiator: false,
      });

    } else {
      waitingUsers.push({
        socketId: socket.id,
        name: userData.name || "Anonymous",
        timestamp: Date.now(),
      });
      socket.emit("waiting");
    }
  });

  socket.on("cancel-match", () => {
    const index = waitingUsers.findIndex(u => u.socketId === socket.id);
    if (index !== -1) waitingUsers.splice(index, 1);
  });

  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("chat-message", ({ message, roomId, senderName }) => {
    socket.to(roomId).emit("chat-message", {
      message,
      senderName,
      senderId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on("end-call", () => {
    const callInfo = activeCalls.get(socket.id);
    if (callInfo) {
      io.to(callInfo.partnerId).emit("call-ended");
      activeCalls.delete(socket.id);
      activeCalls.delete(callInfo.partnerId);
    }
  });

  socket.on("disconnect", () => {
    const waitIndex = waitingUsers.findIndex(u => u.socketId === socket.id);
    if (waitIndex !== -1) waitingUsers.splice(waitIndex, 1);

    const callInfo = activeCalls.get(socket.id);
    if (callInfo) {
      io.to(callInfo.partnerId).emit("call-ended");
      activeCalls.delete(socket.id);
      activeCalls.delete(callInfo.partnerId);
    }
  });
});

// ✅ IMPORTANT: listen on process.env.PORT
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});
