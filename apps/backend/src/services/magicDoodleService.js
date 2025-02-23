export const smoothStrokes = async (strokes) => {
    return strokes.map(point => ({
        x: point.x + Math.random() * 2 - 1,
        y: point.y + Math.random() * 2 - 1
    }));
};

const magicDoodleService = { smoothStrokes };

export default magicDoodleService;
