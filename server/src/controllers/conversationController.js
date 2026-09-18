import Conversation from '../models/Conversation.js';

// GET /api/conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select('title tone createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations.' });
  }
};

// POST /api/conversations
export const createConversation = async (req, res) => {
  try {
    const { tone = 'Professional' } = req.body;

    const conversation = await Conversation.create({
      userId: req.user._id,
      tone,
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create conversation.' });
  }
};

// GET /api/conversations/:id
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation.' });
  }
};

// DELETE /api/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    res.json({ message: 'Conversation deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete conversation.' });
  }
};

// PATCH /api/conversations/:id/tone
export const updateTone = async (req, res) => {
  try {
    const { tone } = req.body;
    const validTones = ['Professional', 'Casual', 'Concise'];

    if (!validTones.includes(tone)) {
      return res.status(400).json({ message: 'Invalid tone. Must be Professional, Casual, or Concise.' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { tone },
      { new: true }
    ).select('tone');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tone.' });
  }
};
