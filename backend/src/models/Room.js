import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true },
    maxCapacity: { type: Number, default: 2 },
    status: { type: String, default: 'Clean' },
    description: { type: String },
    amenities: [{ type: String }],
    images: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
