const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("draw", (data) => {
      io.to(data.roomId).emit("draw", data);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;

