import express from "express";
import cors from "cors";
import http from "http";
import socketHandler from "./websocket/socketHandler.js";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
// TODO: route imports


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"]
  },
});

// Middleware and routes
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

//SocketHandler
socketHandler(io);


export { app, server };
