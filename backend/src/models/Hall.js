import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'Wedding' },
    pricePerHour: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: 'Available' },
    description: { type: String },
    features: [{ type: String }],
    images: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('Hall', hallSchema);
