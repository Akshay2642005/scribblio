import prisma from "../config/db.js";

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user.userId;

    if (!name) return res.status(400).json({ error: "Room name is required!" });

    // Create a new room
    const room = await prisma.room.create({
      data: {
        name,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: "admin", // Creator is admin
          },
        },
      },
    });

    res.status(201).json({ message: "Room created successfully", roomId: room.id });
  } catch (error) {
    console.error("❌ Room creation failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    const userId = req.user.userId;

    if (!roomName) return res.status(400).json({ error: "Room name is required" });

    // Find the room by name
    const room = await prisma.room.findUnique({ where: { name: roomName } });
    if (!room) return res.status(404).json({ error: "Room not found!" });

    const roomId = room.id;

    // Check if the user is already in the room
    const existingMember = await prisma.roomUser.findFirst({
      where: {
        AND: [{ userId: userId }, { roomId: roomId }]
      }
    });

    if (existingMember) {
      return res.status(200).json({ message: "User is already in the room" });
    }

    // Add user to room
    await prisma.roomUser.create({
      data: {
        userId,
        roomId,
        role: "member", // Default role
      },
    });

    res.status(200).json({ message: "User joined successfully", roomId });
  } catch (error) {
    console.error("❌ Error joining room:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRoomUsers = async (req, res) => {
  try {
    const { name } = req.params;

    const users = await prisma.roomUser.findMany({
      where: { name },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    res.json(users.map((entry) => entry.user));
  } catch (error) {
    console.error("❌ Error fetching room users:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    await prisma.roomUser.deleteMany({
      where: {
        AND: [{ userId }, { roomId }],
      },
    });

    res.json({ message: "User left the room" });
  } catch (error) {
    console.error("❌ Error leaving room:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { createRoom, joinRoom, getRoomUsers, leaveRoom };

