import { loadModel, predictGesture } from "../config/models.js";
import prisma from "../config/db.js";

const rooms = new Map(); // Define rooms globally
const activeUsers = {}; // Track active users per room

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // User creates a room
    socket.on('createRoom', (roomId, callback) => {
      console.log('Creating room:', roomId);
      if (rooms.has(roomId)) {
        return callback({ success: false, error: 'Room already exists' });
      }
      rooms.set(roomId, {
        users: [socket.id],
        maxUsers: 5,
        messages: []
      });
      socket.join(roomId);
      callback({ success: true });
      console.log('Room created:', roomId);
    });

    // User joins a room
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);
      if (!activeUsers[roomId]) activeUsers[roomId] = [];
      activeUsers[roomId].push({ id: socket.id, username });

      io.to(roomId).emit("updateUsers", activeUsers[roomId]);
      console.log(`${username} joined room: ${roomId}`);
    });

    // Handle messages
    socket.on("sendMessage", async ({ roomId, userId, content }) => {
      try {
        const message = await prisma.message.create({
          data: { content, senderId: userId, roomId },
          include: { sender: true },
        });
        io.to(roomId).emit("newMessage", message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Handle drawing events
    socket.on("draw", (data) => {
      io.to(data.roomId).emit("draw", data);
    });

    // Handle cursor movement
    socket.on("cursorMove", (data) => {
      io.to(data.roomId).emit("cursorMove", data);
    });

    // Admin clears canvas
    socket.on("clearCanvas", (roomId) => {
      io.to(roomId).emit("clearCanvas");
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      for (const roomId in activeUsers) {
        activeUsers[roomId] = activeUsers[roomId].filter((user) => user.id !== socket.id);
        io.to(roomId).emit("updateUsers", activeUsers[roomId]);
      }
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};
export default socketHandler;



