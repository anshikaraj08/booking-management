import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, { dbName: undefined });
  console.log('Connected to MongoDB');
};

export default connectDB;
