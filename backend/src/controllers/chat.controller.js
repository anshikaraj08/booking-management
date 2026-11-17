import { sendMessageToGemini } from '../services/gemini.service.js';

const MAX_MESSAGE_LENGTH = 2000;

// POST /api/chat  { message } -> { reply }
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` });
    }

    const reply = await sendMessageToGemini(message.trim());
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get a response from the concierge' });
  }
};
