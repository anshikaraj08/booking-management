import { Profile } from '../models/index.js';

// Fields only staff may change on a profile
const ADMIN_ONLY_FIELDS = ['role', 'adminNotes', 'loyaltyPoints', 'loyaltyTier'];

const isAdmin = (req) => req.user.role === 'ADMIN';

// GET /api/profiles?email= — guests always get only their own profile
export const getProfiles = async (req, res) => {
  try {
    const email = isAdmin(req) ? req.query.email : req.user.email;
    const filter = email ? { email } : {};
    const profiles = await Profile.find(filter);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
};

// GET /api/profiles/id/:id
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile || (!isAdmin(req) && profile.email !== req.user.email)) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to fetch profile', details: err.message });
  }
};

// POST /api/profiles
export const createProfile = async (req, res) => {
  try {
    const saved = await new Profile(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create profile', details: err.message });
  }
};

// PUT /api/profiles/:email — update or create by email.
// Guests may only edit their own profile and cannot change staff-only fields.
export const upsertProfileByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile' });
    }

    const updates = { ...req.body };
    delete updates._id;

    if (!isAdmin(req)) {
      if (email !== req.user.email) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }
      ADMIN_ONLY_FIELDS.forEach((field) => delete updates[field]);
    }

    const updated = await Profile.findOneAndUpdate(
      { email },
      { ...updates, email }, // ensure email stays consistent
      {
        new: true,
        upsert: true,
        runValidators: false,
        setDefaultsOnInsert: true
      }
    );

    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: 'Failed to update profile', details: err.message });
  }
};
