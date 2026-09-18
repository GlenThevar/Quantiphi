import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'Quantiphi Chat',
  },
});

const TONE_PROMPTS = {
  Professional:
    'You are a professional AI assistant. Respond formally, precisely, and with structured clarity. Use appropriate technical language and maintain a courteous tone.',
  Casual:
    'You are a friendly AI assistant. Respond in a warm, conversational way — like chatting with a knowledgeable friend. Keep things approachable and fun.',
  Concise:
    'You are a concise AI assistant. Give brief, direct, and accurate answers. Avoid unnecessary words, preamble, or filler. Get straight to the point.',
};

// POST /api/chat/stream
export const streamChat = async (req, res) => {
  const { conversationId, prompt } = req.body;

  if (!conversationId || !prompt?.trim()) {
    return res.status(400).json({ message: 'conversationId and prompt are required.' });
  }

  // Fetch conversation and verify ownership
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  // Build message history for context (last 20 messages)
  const history = conversation.messages.slice(-20).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const systemPrompt = TONE_PROMPTS[conversation.tone] || TONE_PROMPTS.Professional;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: prompt.trim() },
  ];

  // Save user message immediately
  conversation.messages.push({ role: 'user', content: prompt.trim() });

  // Generate title from first message if still default
  if (conversation.title === 'New Conversation') {
    conversation.generateTitle();
  }

  await conversation.save();

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let fullResponse = '';

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_ID,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant response to DB
    conversation.messages.push({ role: 'assistant', content: fullResponse });
    await conversation.save();

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI service error. Please try again.' })}\n\n`);
    res.end();
  }
};
