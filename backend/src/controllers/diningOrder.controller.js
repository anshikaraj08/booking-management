import { DiningOrder } from '../models/index.js';

// GET /api/dining-orders — guests see their own, admins see all
export const getDiningOrders = async (req, res) => {
  try {
    const filter = req.user.role === 'GUEST' ? { guestEmail: req.user.email } : {};
    const orders = await DiningOrder.find(filter);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dining orders' });
  }
};

// POST /api/dining-orders
export const createDiningOrder = async (req, res) => {
  try {
    const saved = await new DiningOrder(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create dining order', details: err.message });
  }
};

// PUT /api/dining-orders/:id
export const updateDiningOrder = async (req, res) => {
  try {
    const updated = await DiningOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Dining order not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update dining order', details: err.message });
  }
};
