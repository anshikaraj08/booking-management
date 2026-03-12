# Deployment Guide - Aetheria Heights

This guide covers deploying your full-stack project using **Render** for both frontend and backend, with **MongoDB Atlas** as the database.

## 📋 Prerequisites

Before starting, ensure you have:
- A GitHub account
- A Render account (free tier available at render.com)
- A MongoDB Atlas account (free tier available at mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://account.mongodb.com/account/login)
2. Sign up or log in
3. Create a new organization and project
4. Click "Create" to build a new database
5. Choose **Free** tier (M0 Sandbox)
6. Select your region
7. Click "Create Deployment"

### 1.2 Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Set permissions to "Atlas admin"
5. Click "Add User"

### 1.3 Configure Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add 0.0.0.0/0)
4. Confirm

### 1.4 Get Connection String
1. Click "Databases" in the left sidebar
2. Click "Connect" button
3. Select "Drivers" → "Node.js"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/aetheria_heights?retryWrites=true&w=majority`

---

## 🚀 Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository
```bash
cd "e:\FINAL PROJECT\FINAL PROJECT 2"
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New" to create a new repository
3. Name it: `aetheria-heights`
4. Don't initialize with README (you have one)
5. Click "Create repository"

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/aetheria-heights.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 3: Deploy Backend on Render

### 3.1 Create Backend Service
1. Go to [Render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click "New +" → "Web Service"
4. Click "Connect to GitHub"
5. Select the `aetheria-heights` repository
6. Fill in:
   - **Name**: `aetheria-heights-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 3.2 Add Environment Variables
Click "Advanced" → Add the following:

```
NODE_ENV              = production
PORT                  = 3001
MONGO_URI             = mongodb+srv://username:password@cluster.mongodb.net/aetheria_heights?retryWrites=true&w=majority
JWT_SECRET            = (generate strong key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GEMINI_API_KEY        = AIzaSyB-Heur95aJc-Urupap_NL3Xp4mfNICDD0
EMAIL_USER            = shaik.ibad4455@gmail.com
EMAIL_PASS            = hgapeaktvfmlpgmg
FRONTEND_URL          = https://aetheria-heights-frontend.onrender.com
```

### 3.3 Deploy
Click "Create Web Service" and wait for deployment to complete.

**Note the Backend URL** (e.g., `https://aetheria-heights-backend.onrender.com`)

---

## 🎨 Step 4: Deploy Frontend on Render

### 4.1 Create Frontend Service
1. On Render dashboard, click "New +" → "Static Site"
2. Select the `aetheria-heights` repository
3. Fill in:
   - **Name**: `aetheria-heights-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 4.2 Add Environment Variables
Click "Advanced" → Add:

```
VITE_API_URL = https://aetheria-heights-backend.onrender.com
```

### 4.3 Deploy
Click "Create Static Site" and wait for deployment.

---

## 🔐 Step 5: Update CORS (Important!)

Update [server.js](server.js) to allow requests from your frontend domain:

Replace:
```javascript
app.use(cors());
```

With:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

Then commit and push:
```bash
git add .
git commit -m "Update CORS configuration for production"
git push
```

Render will automatically redeploy on push!

---

## 🧪 Step 6: Test the Deployment

1. Visit your frontend URL (e.g., `https://aetheria-heights-frontend.onrender.com`)
2. Test authentication, CRUD operations, and email functionality
3. Check Render logs for any errors:
   - Backend logs: Render dashboard → Backend service → "Logs"
   - Frontend logs: Browser DevTools → Console

---

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Verify MONGO_URI in Render environment variables
- Check MongoDB Atlas network access includes 0.0.0.0/0
- Test connection string locally first

### Frontend not calling backend API
- Ensure FRONTEND_URL in backend matches your frontend domain
- Check browser DevTools → Network tab for API calls
- Verify VITE_API_URL is set in frontend environment variables

### Free tier limitations
- Free services sleep after 15 min of inactivity
- First request takes 30 seconds to wake up
- Upgrade to paid tiers for production apps

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-testing.html)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

---

## 💡 Production Checklist

- [ ] Generated strong JWT_SECRET
- [ ] Updated EMAIL_PASS and EMAIL_USER
- [ ] Verified MONGO_URI
- [ ] Set FRONTEND_URL to your domain
- [ ] Updated CORS configuration
- [ ] Tested all API endpoints
- [ ] Tested authentication
- [ ] Tested email functionality
- [ ] Checked error logs
- [ ] Set up monitoring (optional)

