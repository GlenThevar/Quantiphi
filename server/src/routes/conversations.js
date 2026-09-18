import express from 'express';
import {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  updateTone,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All conversation routes require auth

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.delete('/:id', deleteConversation);
router.patch('/:id/tone', updateTone);

export default router;
