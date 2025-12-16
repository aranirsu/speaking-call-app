const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const port = process.env.PORT || 3001;

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "SpeakFlow Socket Server is running!",
    waiting: waitingUsers.length,
    activeCalls: activeCalls.size / 2
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

const httpServer = createServer(app);

// Store waiting users and active calls
const waitingUsers = [];
const activeCalls = new Map();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User starts looking for a match
  socket.on("find-match", (userData) => {
    console.log("User looking for match:", socket.id, userData);

    // Check if user is already in waiting list (prevent duplicate)
    const alreadyWaiting = waitingUsers.find((u) => u.socketId === socket.id);
    if (alreadyWaiting) {
      console.log("User already waiting:", socket.id);
      return;
    }

    // Check if user is already in a call
    if (activeCalls.has(socket.id)) {
      console.log("User already in a call:", socket.id);
      return;
    }

    // Find a partner (exclude self)
    const partnerIndex = waitingUsers.findIndex((u) => u.socketId !== socket.id);
    
    if (partnerIndex !== -1) {
      const partner = waitingUsers.splice(partnerIndex, 1)[0];

      // Create a room for the call
      const roomId = `room-${Date.now()}-${socket.id.slice(0,4)}-${partner.socketId.slice(0,4)}`;

      // Store active call info
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

      // Join both users to the room
      socket.join(roomId);
      io.sockets.sockets.get(partner.socketId)?.join(roomId);

      // Notify both users they're matched
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

      console.log("✅ Match created between", socket.id, "and", partner.socketId);
    } else {
      // Add user to waiting list
      waitingUsers.push({
        socketId: socket.id,
        name: userData.name || "Anonymous",
        timestamp: Date.now(),
      });
      socket.emit("waiting");
      console.log("User added to waiting list:", socket.id, "| Total waiting:", waitingUsers.length);
    }
  });

  // Cancel matching
  socket.on("cancel-match", () => {
    const index = waitingUsers.findIndex((u) => u.socketId === socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
      console.log("User cancelled matching:", socket.id);
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ offer, roomId }) => {
    console.log("📤 Offer received from", socket.id, "for room", roomId);
    socket.to(roomId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log("📤 Answer received from", socket.id, "for room", roomId);
    socket.to(roomId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log("🧊 ICE candidate from", socket.id, "for room", roomId);
    socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Chat message
  socket.on("chat-message", ({ message, roomId, senderName }) => {
    socket.to(roomId).emit("chat-message", { 
      message, 
      senderName,
      senderId: socket.id,
      timestamp: Date.now() 
    });
    console.log("Chat message in room", roomId, ":", message);
  });

  // End call
  socket.on("end-call", () => {
    const callInfo = activeCalls.get(socket.id);
    if (callInfo) {
      io.to(callInfo.partnerId).emit("call-ended");
      activeCalls.delete(socket.id);
      activeCalls.delete(callInfo.partnerId);
      console.log("Call ended by:", socket.id);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove from waiting list
    const waitIndex = waitingUsers.findIndex((u) => u.socketId === socket.id);
    if (waitIndex !== -1) {
      waitingUsers.splice(waitIndex, 1);
    }

    // End any active call
    const callInfo = activeCalls.get(socket.id);
    if (callInfo) {
      io.to(callInfo.partnerId).emit("call-ended");
      activeCalls.delete(socket.id);
      activeCalls.delete(callInfo.partnerId);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Socket.io server running on port ${port}`);
});
