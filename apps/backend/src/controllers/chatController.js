import prisma from "../config/db.js";

const postMessages = async (req, res) => {
  const { content } = req.body;
  const { roomId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: User ID missing" });
  }

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
    console.log(error);
    res.status(500).json({ error: "Failed to send message" });
  }
}

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}



export default { postMessages, getMessages };
