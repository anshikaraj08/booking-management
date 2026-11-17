import { Feedback } from '../models/index.js';

// GET /api/feedbacks — guests see their own, admins see all
export const getFeedbacks = async (req, res) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { email: req.user.email };
    const feedbacks = await Feedback.find(filter);
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

// POST /api/feedbacks
export const createFeedback = async (req, res) => {
  try {
    const saved = await new Feedback(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create feedback', details: err.message });
  }
};
