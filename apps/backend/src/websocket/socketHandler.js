import * as tf from "@tensorflow/tfjs";
import { loadModel, predictGesture } from "ai-model";
import { translateText } from "../controllers/translateController.js"; // Ensure this exists
import prisma from "../config/db.js";

const activeUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // Load AI model when server starts
    loadModel().then(() => console.log("✅ AI Model Loaded"));

    // AI Gesture Recognition
    socket.on("hand_data", async ({ roomId, landmarks }) => {
      const prediction = await predictGesture(landmarks);
      if (prediction === "draw") {
        io.to(roomId).emit("draw", landmarks[8]); // Index finger tip
      } else if (prediction === "erase") {
        io.to(roomId).emit("clearCanvas");
      }
    });

    // Translation Request
    socket.on("translate_request", async ({ text, targetLang, roomId }) => {
      try {
        const translatedText = await translateText(text, targetLang);
        io.to(roomId).emit("translated_text", { text, translatedText, targetLang });
      } catch (error) {
        console.error("Translation Error:", error);
      }
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


