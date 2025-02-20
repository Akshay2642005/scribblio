import roomService from "../services/roomService.js";

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const room = await roomService.createRoom(name);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: "Error creating room" });
  }
};

export default { createRoom };

