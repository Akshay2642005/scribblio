import magicDoodleService from '../services/magicDoodleService.js';

export const processDrawing = async (req, res) => {
    try {
        const { strokes } = req.body;
        const smoothedStrokes = await magicDoodleService.smoothStrokes(strokes);
        res.json({ success: true, data: smoothedStrokes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
