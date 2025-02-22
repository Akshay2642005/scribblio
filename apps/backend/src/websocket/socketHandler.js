const activeUsers = {}

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // User joins a room
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);

      if (!activeUsers[roomId]) activeUsers[roomId] = [];
      activeUsers[roomId].push({ id: socket.id, username });

      io.to(roomId).emit("updateUsers", activeUsers[roomId]); // Broadcast user list
      console.log(`${username} joined room: ${roomId}`);
    });

    // Handle drawing events
    socket.on("draw", (data) => {
      io.to(data.roomId).emit("draw", data);
    });

    // Handle real-time cursor movement
    socket.on("cursorMove", (data) => {
      io.to(data.roomId).emit("cursorMove", data);
    });

    // Admin clears canvas
    socket.on("clearCanvas", (roomId) => {
      io.to(roomId).emit("clearCanvas");
    });

    // Admin kicks a user
    socket.on("kickUser", ({ roomId, targetSocketId }) => {
      io.to(targetSocketId).emit("kicked");
      io.sockets.sockets.get(targetSocketId)?.disconnect();
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

