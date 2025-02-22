import prisma from "../config/db.js";

const createRoom = async (name, ownerId) => {
  if (!name || !ownerId) throw new Error("Room name and ownerId are required!");

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!user) throw new Error("User does not exist!");

  try {
    const room = await prisma.room.create({
      data: {
        name,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: "admin",
          },
        },
      },
    });

    return room;
  } catch (error) {
    console.error("❌ Error creating room:", error);
    throw new Error("Database error: Unable to create room.");
  }
};

export default { createRoom };

