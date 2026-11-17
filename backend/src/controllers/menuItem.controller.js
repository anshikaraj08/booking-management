import { MenuItem } from '../models/index.js';

// GET /api/menu-items
export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// POST /api/menu-items
export const createMenuItem = async (req, res) => {
  try {
    const saved = await new MenuItem(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create menu item', details: err.message });
  }
};

// PUT /api/menu-items/:id
export const updateMenuItem = async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Menu item not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update menu item', details: err.message });
  }
};

// DELETE /api/menu-items/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete menu item', details: err.message });
  }
};
