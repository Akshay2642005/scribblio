import prisma from "../config/db.js";

const createRoom = async (name) => {
  return await prisma.room.create({ data: { name } });
};

export default { createRoom };

