import prisma from "../config/db.js";

const isAdmin = async (roomId, userId) => {
  const user = await prisma.roomUser.findUnique({
    where: {
      userId_rooomID: {
        userId, roomId
      }
    },
  });

  return user && user.role === "admin";
};

const makeAdmin = async (roomId, adminId, targetUserId) => {
  if (!(await isAdmin(roomId, adminId))) throw new Error("You are not an admin");

  return await prisma.roomUser.update({
    where: { userId_roomId: { userId: targetUserId, roomId } },
    data: { role: "admin" },
  });
};

const createRoom = async (name, ownerId) => {
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

  return room;
};

export default { createRoom };

