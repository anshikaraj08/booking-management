import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Feedback', 'Complaint'], default: 'Feedback' },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
