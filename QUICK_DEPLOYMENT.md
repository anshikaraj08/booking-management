# Quick Deployment Summary

## Architecture
```
Frontend (React + Vite) ──→ Render Static Site
                           ↓
Backend (Express + Node)  ──→ Render Web Service
                           ↓
Database (MongoDB)     ──→ MongoDB Atlas
```

## Deployment Flow

### 1️⃣ **MongoDB Atlas** (Free Tier)
- Database: `aetheria_heights`
- Connection string: `mongodb+srv://user:pass@cluster.mongodb.net/aetheria_heights?retryWrites=true&w=majority`

### 2️⃣ **GitHub** 
- Create repository
- Push code with git

### 3️⃣ **Render Backend** 
- Web Service
- Start Command: `node server.js`
- Environment Variables:
  ```
  NODE_ENV=production
  MONGO_URI=(from MongoDB Atlas)
  JWT_SECRET=(strong random string)
  GEMINI_API_KEY=(your API key)
  EMAIL_USER=(email)
  EMAIL_PASS=(app password)
  FRONTEND_URL=(production frontend URL)
  ```

### 4️⃣ **Render Frontend**
- Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variables:
  ```
  VITE_API_URL=(production backend URL)
  ```

## Environment Variables Summary

### Development (.env.local)
```
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/aetheria_heights
JWT_SECRET=dev-secret-key (NOT PRODUCTION)
GEMINI_API_KEY=your_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
```

### Production (.env.production)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aetheria_heights?retryWrites=true&w=majority
JWT_SECRET=STRONG_RANDOM_STRING_HERE
GEMINI_API_KEY=your_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=https://aetheria-heights-frontend.onrender.com
VITE_API_URL=https://aetheria-heights-backend.onrender.com
```

## Timeline
- ⏱️ **MongoDB**: 5-10 minutes
- ⏱️ **GitHub**: 5 minutes  
- ⏱️ **Render Deployment**: 5-10 minutes
- ⏱️ **Total**: ~20-30 minutes

## Cost Estimate (Free Tier)
- MongoDB Atlas: Free (512MB storage)
- Render: Free (but services sleep after inactivity)
- GitHub: Free

## Important Notes
⚠️ **Free tier limitations:**
- Services sleep after 15 minutes of inactivity
- First request after sleeping takes ~30 seconds
- For production, upgrade to paid Render plans

✅ **Security:**
- Never commit `.env.local` or actual secrets
- Use Render dashboard for environment variables
- Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Support
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps
- See [Render Docs](https://render.com/docs) for troubleshooting
- MongoDB Atlas [Documentation](https://docs.atlas.mongodb.com)
