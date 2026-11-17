import mongoose from 'mongoose';

const diningOrderSchema = new mongoose.Schema(
  {
    guestEmail: { type: String, required: true },
    guestName: { type: String },
    items: [
      {
        menuItemId: String,
        name: String,
        quantity: Number,
        price: Number
      }
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Served', 'Cancelled'],
      default: 'Pending'
    },
    orderTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('DiningOrder', diningOrderSchema);
