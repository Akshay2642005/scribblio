import express from "express";
import cors from "cors";
import http from "http";
// import { Server } from "socket.io";

// TODO: route imports


const app = express();
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

////routes
//app.use("/api/rooms", roomRoutes);
//app.use("/api/users", userRoutes);
//app.use("/api/drawings", drawingRoutes);
//
////SocketHandler
//socketHandler(io);
//
export { app, server };
