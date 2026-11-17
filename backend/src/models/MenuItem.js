import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, default: 'Western' },
    type: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
    images: [{ type: String }],
    calories: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
