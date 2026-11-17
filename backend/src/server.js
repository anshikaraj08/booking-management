import env from './config/env.js';
import connectDB from './config/db.js';
import { verifyMailer } from './config/mailer.js';
import app from './app.js';

const startServer = async () => {
  try {
    verifyMailer();
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
