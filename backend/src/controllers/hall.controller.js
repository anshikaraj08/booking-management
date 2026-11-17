import { Hall } from '../models/index.js';

// GET /api/halls
export const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
};

// POST /api/halls
export const createHall = async (req, res) => {
  try {
    const saved = await new Hall(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create hall', details: err.message });
  }
};

// PUT /api/halls/:id
export const updateHall = async (req, res) => {
  try {
    const updated = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Hall not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update hall', details: err.message });
  }
};

// DELETE /api/halls/:id
export const deleteHall = async (req, res) => {
  try {
    const deleted = await Hall.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Hall not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete hall', details: err.message });
  }
};
