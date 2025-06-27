# Deployment Guide

This guide covers deploying the Smart Notes Organizer to various cloud platforms.

## 🚀 Render (Recommended - Full Stack)

Render can host both your frontend and backend with a database.

### Option 1: Using render.yaml (Automated)

1. **Push your code to GitHub** (with the included `render.yaml`)

2. **Connect to Render**:
   - Go to [render.com](https://render.com) and sign up
   - Connect your GitHub account
   - Click "New" → "Blueprint"
   - Select your repository
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables**:
   - In the Render dashboard, go to your API service
   - Add environment variables:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     ```

4. **Deploy**: Render will automatically deploy both services and create a database

### Option 2: Manual Setup

#### Backend (API Service)
1. **Create Web Service**:
   - Service Type: Web Service
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   CLIENT_URL=https://your-frontend-url.onrender.com
   ```

#### Frontend (Static Site)
1. **Create Static Site**:
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

#### Database
1. **Create PostgreSQL Database** (or use MongoDB Atlas)
2. **Copy connection string** to backend environment variables

### URLs
- Frontend: `https://your-app-name.onrender.com`
- Backend: `https://your-api-name.onrender.com`

---

## ⚡ Vercel (Frontend Only)

Vercel is excellent for the React frontend, but you'll need a separate backend service.

### Frontend Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from client directory**:
   ```bash
   cd client
   vercel
   ```

3. **Or connect via GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build settings:
     - Framework: Vite
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

### Backend Options for Vercel
Since Vercel has limited backend support, deploy your backend elsewhere:

1. **Render** (recommended)
2. **Railway**
3. **Heroku**
4. **DigitalOcean App Platform**

---

## 🐳 Docker Deployment

### Using Docker Compose

1. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     frontend:
       build:
         context: ./client
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - VITE_API_URL=http://localhost:5000/api

     backend:
       build:
         context: ./server
         dockerfile: Dockerfile
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/smartnotes
         - GROQ_API_KEY=your_api_key
       depends_on:
         - mongo

     mongo:
       image: mongo:5.0
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db

   volumes:
     mongo_data:
   ```

2. **Run**:
   ```bash
   docker-compose up -d
   ```

---

## 🌐 Other Platforms

### Railway
1. Connect GitHub repository
2. Deploy backend as Node.js service
3. Deploy frontend as static site
4. Add MongoDB database

### Heroku
1. Create two apps (frontend and backend)
2. Deploy backend with Node.js buildpack
3. Deploy frontend with static buildpack
4. Add MongoDB Atlas add-on

### DigitalOcean App Platform
1. Create app from GitHub
2. Configure both frontend and backend components
3. Add managed database

---

## 📋 Pre-Deployment Checklist

### Environment Variables
- [ ] `GROQ_API_KEY` - Get from [Groq Console](https://console.groq.com/)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `CLIENT_URL` - Frontend URL for CORS
- [ ] `VITE_API_URL` - Backend API URL for frontend

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Connection string obtained
- [ ] Network access configured (allow all IPs: 0.0.0.0/0)

### Code Preparation
- [ ] All environment variables in `.env.example` files
- [ ] Build commands work locally
- [ ] No hardcoded URLs in code
- [ ] CORS configured for production domains

---

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Update `CLIENT_URL` in backend environment
   - Check CORS configuration in `server.js`

2. **Build Failures**:
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility

3. **Database Connection**:
   - Verify MongoDB URI format
   - Check network access settings in MongoDB Atlas

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names match exactly

5. **File Upload Issues**:
   - Configure file storage for production
   - Consider using cloud storage (AWS S3, Cloudinary)

### Logs and Debugging
- Check deployment logs in platform dashboard
- Use health check endpoint: `/api/health`
- Monitor application logs for errors

---

## 🚀 Recommended Deployment Strategy

1. **Start with Render** - easiest full-stack deployment
2. **Use MongoDB Atlas** - managed database service
3. **Get Groq API key** - for AI functionality
4. **Test thoroughly** - verify all features work in production
5. **Set up monitoring** - use platform monitoring tools

This approach gives you a fully functional deployment with minimal configuration!