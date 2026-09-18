import express from 'express';
import { streamChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/stream', protect, streamChat);

export default router;
