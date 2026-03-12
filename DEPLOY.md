# Aetheria Heights - Deployment Instructions

## 🎯 Quick Start (Choose One Option)

### **Option 1: Render + MongoDB Atlas (Recommended)** ✅
Free tier, easy to use, perfect for learners

### **Option 2: Vercel + Render + MongoDB Atlas**
Frontend on Vercel, Backend on Render

---

## 📋 Prerequisite Checklist

- [ ] GitHub account (needed for deployment)
- [ ] Render account (render.com - free)
- [ ] MongoDB Atlas account (mongodb.com - free)
- [ ] Project code pushed to GitHub
- [ ] Node.js and npm installed locally

---

## 🚀 Option 1: Complete Render Deployment (Recommended)

### Step 1: Set Up MongoDB Atlas (5-10 min)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**:
   - Click "Create" → Select "Free" tier (M0 Sandbox)
   - Choose your region
   - Click "Create Deployment"
3. **Create User**:
   - Go to "Database Access"
   - Add user with username/password (save these!)
   - Set to "Atlas admin" role
4. **Allow Network Access**:
   - Go to "Network Access"
   - Click "Allow Access from Anywhere"
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Drivers" → "Node.js"
   - Copy the string: `mongodb+srv://username:password@cluster.mongodb.net/aetheria_heights?retryWrites=true&w=majority`

### Step 2: Push to GitHub (5 min)

```bash
# Initialize and push
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/aetheria-heights.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend on Render (5-10 min)

1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. **Configure**:
   - Name: `aetheria-heights-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: `Free`
5. **Add Environment Variables** (click Advanced):
   ```
   NODE_ENV = production
   MONGO_URI = (from MongoDB Atlas)
   JWT_SECRET = (run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   GEMINI_API_KEY = AIzaSyB-Heur95aJc-Urupap_NL3Xp4mfNICDD0
   EMAIL_USER = shaik.ibad4455@gmail.com
   EMAIL_PASS = hgapeaktvfmlpgmg
   FRONTEND_URL = (you'll set this after frontend deployment)
   ```
6. Click "Create Web Service"
7. **Note the Backend URL** (e.g., `https://aetheria-heights-backend.onrender.com`)

### Step 4: Deploy Frontend on Render (5-10 min)

1. Click "New Static Site"
2. Connect GitHub repository (same one)
3. **Configure**:
   - Name: `aetheria-heights-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. **Add Environment Variable**:
   ```
   VITE_API_URL = (your backend URL from step 3)
   ```
5. Click "Create Static Site"
6. **Note the Frontend URL** (e.g., `https://aetheria-heights-frontend.onrender.com`)

### Step 5: Update Backend CORS (Back in Render)

1. Go back to backend service settings
2. Update `FRONTEND_URL` environment variable to your frontend URL
3. Render will auto-redeploy

---

## 🔄 Option 2: Vercel + Render + MongoDB Atlas

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. **Environment Variables**:
   ```
   VITE_API_URL = (your Render backend URL)
   ```
5. Click "Deploy"

### Backend on Render (Same as Option 1, Step 3-5)

---

## ✅ Verify Deployment

- [ ] Visit frontend URL - should load
- [ ] Try signing up/logging in
- [ ] Test CRUD operations (add room, edit booking)
- [ ] Check browser console for API errors
- [ ] Check Render logs: Dashboard → Service → Logs

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check MONGO_URI is correct
- Verify MongoDB Atlas network security allows 0.0.0.0/0
- Test connection locally first

### "Frontend can't reach backend"
- Verify VITE_API_URL matches backend URL
- Check FRONTEND_URL in backend matches frontend URL
- Check CORS in server.js

### "Free tier services are slow"
- Free services sleep after 15 min no activity
- First request takes ~30 sec to wake up
- Upgrade to paid for production

### Check Logs

**Render Backend Logs**:
```
Dashboard → Backend Service → Logs
```

**Frontend Console**:
```
DevTools → Console (F12)
```

---

## 📝 Local Development Testing

Before deploying, test everything locally:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

Visit `http://localhost:3000` and test:
- Authentication
- Create/Read/Update/Delete operations
- Email sending
- All API calls work

---

## 🔐 Security Notes

**Before Production:**
- [ ] Generate strong JWT_SECRET
- [ ] Use real email credentials (or update)
- [ ] Never commit .env.local with secrets
- [ ] Set NODE_ENV=production
- [ ] Update CORS to frontend domain only

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📚 Additional Help

- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Vercel Docs](https://vercel.com/docs)
- [Express CORS](https://github.com/expressjs/cors)
- [Vite Guide](https://vitejs.dev)

---

## 🎓 Learning Resources

### Deployment Concepts
- **Environment Variables**: Different config for dev/production
- **CORS**: Controls which domains can access your API
- **MongoDB Atlas**: Hosted MongoDB database service
- **Render**: Free service for hosting web apps
- **Static Sites**: Frontend served as static files
- **Web Services**: Backend server that runs code

### Production Checklist
- [ ] All environment variables set
- [ ] Error logging enabled
- [ ] CORS configured properly
- [ ] Database backed up
- [ ] Security headers set
- [ ] Rate limiting enabled (optional)

---

**Your project is production-ready! Choose a deployment option above and follow the steps. 🚀**

