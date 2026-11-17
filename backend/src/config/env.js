import dotenv from 'dotenv';

// Load backend/.env.local first, then backend/.env (values already set are not overridden)
dotenv.config({ path: ['.env.local', '.env'] });

const env = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/aetheria_heights',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'your-app-password',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY
};

export default env;
