import express from "express";
import roomController from "../controllers/roomController.js";

const router = express.Router();

router.post("/", roomController.createRoom);

export default router;

