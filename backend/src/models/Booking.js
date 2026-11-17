import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingCategory: { type: String, enum: ['ROOM', 'HALL'], required: true },
    roomId: { type: String, required: true },
    roomType: { type: String },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
