// import { loadModel, predictGesture } from "../config/models.js";
const rooms = new Map(); // Global rooms storage
const activeUsers = {}; // Track active users per room

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // User creates a room
    socket.on("createRoom", (roomId, callback) => {
      console.log(`Creating room: ${roomId}`);

      if (rooms.has(roomId)) {
        return callback({ success: false, error: "Room already exists" });
      }

      rooms.set(roomId, {
        users: [socket.id],
        maxUsers: 5,
        messages: [],
      });

      socket.join(roomId);
      activeUsers[roomId] = [{ id: socket.id, username: `User-${socket.id}` }];
      io.to(roomId).emit("updateUsers", activeUsers[roomId]);

      callback({ success: true });
      console.log(`Room created: ${roomId}`);
    });

    // User joins a room
    socket.on("joinRoom", ({ roomId, username }, callback) => {
      console.log(`User ${username} is trying to join room: ${roomId}`);

      if (!rooms.has(roomId)) {
        return callback({ success: false, error: "Room does not exist" });
      }

      const room = rooms.get(roomId);
      if (room.users.length >= room.maxUsers) {
        return callback({ success: false, error: "Room is full" });
      }

      room.users.push(socket.id);
      socket.join(roomId);

      if (!activeUsers[roomId]) activeUsers[roomId] = [];
      activeUsers[roomId].push({ id: socket.id, username });

      io.to(roomId).emit("updateUsers", activeUsers[roomId]);
      callback({ success: true });
      console.log(`${username} joined room: ${roomId}`);
    });

    // Handle messages
    socket.on("sendMessage", async ({ roomId, userId, content }) => {
      console.log(`Message from ${userId} in room ${roomId}: ${content}`);
      try {
        const message = {
          content,
          senderId: userId,
          roomId,
          timestamp: new Date(),
        };

        if (rooms.has(roomId)) {
          rooms.get(roomId).messages.push(message);
        }

        io.to(roomId).emit("newMessage", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle drawing events
    socket.on("draw", (data) => {
      console.log(`Drawing event in room: ${data.roomId}`);
      io.to(data.roomId).emit("draw", data);
    });

    // Handle cursor movement
    socket.on("cursorMove", (data) => {
      io.to(data.roomId).emit("cursorMove", data);
    });

    // Admin clears canvas
    socket.on("clearCanvas", (roomId) => {
      console.log(`Canvas cleared in room: ${roomId}`);
      io.to(roomId).emit("clearCanvas");
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);

      for (const roomId in activeUsers) {
        activeUsers[roomId] = activeUsers[roomId].filter((user) => user.id !== socket.id);
        io.to(roomId).emit("updateUsers", activeUsers[roomId]);
      }

      // Remove user from rooms
      rooms.forEach((room, id) => {
        room.users = room.users.filter((userId) => userId !== socket.id);
        if (room.users.length === 0) rooms.delete(id);
      });

      console.log(`Active users updated after ${socket.id} left.`);
    });
  });
};

export default socketHandler;


