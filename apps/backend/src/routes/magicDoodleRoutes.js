import express from 'express';
import { processDrawing } from '../controllers/magicDoodleController.js';

const router = express.Router();
router.post('/magic-doodle', processDrawing);  

export default router;
