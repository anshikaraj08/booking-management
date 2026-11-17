import { Booking } from '../models/index.js';

// GET /api/bookings — guests see their own, admins see all
export const getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'GUEST' ? { guestEmail: req.user.email } : {};
    const bookings = await Booking.find(filter);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const saved = await new Booking(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create booking', details: err.message });
  }
};

// PUT /api/bookings/:id (admin)
export const updateBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update booking', details: err.message });
  }
};

// DELETE /api/bookings/:id (admin)
export const deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete booking', details: err.message });
  }
};
