import { Router } from "express";
import prisma from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = Router();

router.post("/:roomId/messages", authMiddleware, async (req, res) => {
  const { content } = req.body;
  const { roomId } = req.params;
  const userId = req.user.id; 

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        roomId,
      },
      include: { sender: true },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
