import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['GUEST', 'ADMIN'], default: 'GUEST' },
    phone: { type: String },
    address: { type: String },
    location: { type: String },
    hotelName: { type: String },
    paymentMethods: [{ type: mongoose.Schema.Types.Mixed }],
    // Store documents as flexible objects so uploads don't fail on schema mismatch
    documents: [{ type: mongoose.Schema.Types.Mixed }],
    preferences: {
      preferredFloor: String,
      pillowType: String,
      dietaryRestrictions: [String],
      newsletter: Boolean
    },
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: { type: String, default: 'Silver' },
    adminNotes: { type: String },
    profileImage: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
