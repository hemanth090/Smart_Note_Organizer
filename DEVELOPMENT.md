# Development Guide

This guide covers local development setup, debugging, and troubleshooting for the Smart Notes Organizer.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Server Configuration](#server-configuration)
- [Debugging Guide](#debugging-guide)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Development Tools](#development-tools)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation
```bash
# Clone and install dependencies
git clone <repository-url>
cd mernSmartNote
npm run install:all
```

### Environment Setup
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Start Development Servers
```bash
# Option 1: Start both servers simultaneously
npm run dev

# Option 2: Start servers separately
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

---

## 🔧 Development Environment

### Current Configuration
- **Backend Server**: http://localhost:5002
- **Frontend Server**: http://localhost:5173
- **API Base URL**: http://localhost:5002/api
- **Database**: MongoDB Atlas

### Environment Variables

#### Server (.env)
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5002/api
VITE_APP_NAME=Smart Notes Organizer
VITE_APP_VERSION=1.0.0
```

---

## 🖥️ Server Configuration

### Expected Backend Startup Output
```
🚀 Smart Notes Organizer server running on port 5002
📝 Environment: development
🌐 API URL: http://localhost:5002/api
🔗 Client URL: http://localhost:5173
📊 MongoDB Connected: cluster0.l8bmdwu.mongodb.net
🗄️ Database: test
```

### Expected Frontend Startup Output
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/test-connection` - Frontend connectivity test
- `POST /api/notes/process` - Process image with OCR and AI
- `POST /api/notes/ocr-only` - OCR extraction only
- `GET /api/notes/history` - Get notes history
- `GET /api/notes/recent` - Get recent notes

---

## 🐛 Debugging Guide

### Step-by-Step Debugging Process

#### Step 1: Test Minimal Server
Test if basic Express server works:
```bash
cd server
node minimal-server.js
```

**Expected Output:**
```
🚀 Minimal server running on http://localhost:5002
🌐 Test URLs:
   - http://localhost:5002/
   - http://localhost:5002/api
   - http://localhost:5002/api/health
   - http://localhost:5002/api/test-connection
```

**Test:** Open http://localhost:5002/api/health in browser
- ✅ **Works**: Basic Express setup is fine
- ❌ **Fails**: Fundamental Node.js/Express issue

#### Step 2: Test Server Without Database
If Step 1 works, test server without MongoDB:
```bash
cd server
node server-no-db.js
```

**Expected Output:**
```
🚀 Smart Notes Organizer server (No DB) running on port 5002
📝 Environment: development
🌐 API URL: http://localhost:5002/api
🔗 Client URL: http://localhost:5173
🧪 Test connection: http://localhost:5002/api/test-connection
```

**Test:** Open http://localhost:5002/api/test-connection
- ✅ **Works**: Issue is with MongoDB connection
- ❌ **Fails**: Express configuration problem

#### Step 3: Test Frontend Connection
Open the connection test page:
```bash
# Open in browser
client/test-connection.html
```

Click "Test /api/health" button to test all API endpoints.

#### Step 4: Test Full Server
If Steps 1-3 work, try the full server:
```bash
cd server
npm run dev
```

Watch for:
- MongoDB connection messages
- Error messages
- Port binding confirmation

#### Step 5: Test Frontend
If backend is running successfully:
```bash
cd client
npm run dev
```

Then open http://localhost:5173

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5002
netstat -ano | findstr :5173

# Kill specific process (replace PID)
taskkill /F /PID [PID]

# Kill all Node processes
taskkill /F /IM node.exe
```

#### MongoDB Connection Failed
- Check MongoDB Atlas accessibility
- Verify connection string in `.env`
- Try running `server-no-db.js` to bypass MongoDB
- Check network access settings in MongoDB Atlas (allow 0.0.0.0/0)

#### CORS Errors
- Check browser console for CORS errors
- Verify frontend runs on port 5173
- Check backend CORS configuration
- Ensure `CLIENT_URL` matches frontend URL

#### Environment Variables Issues
- Verify `.env` files exist in both directories
- Check `VITE_API_URL` in `client/.env`
- Check `PORT` in `server/.env`
- Restart servers after changing environment variables

#### "Failed to Connect to Server" Error
**Root Causes:**
1. Backend server not running
2. Port conflicts
3. CORS configuration issues
4. MongoDB connection blocking startup
5. Environment variable mismatches

**Solutions:**
1. Kill all Node processes: `taskkill /F /IM node.exe`
2. Follow debugging steps 1-5 above
3. Check Windows Firewall settings
4. Check antivirus interference
5. Try alternative ports (3001/3000)

#### Recent Notes Are Empty
1. Process an image first to create a note
2. Check browser console for API call logs
3. Test endpoint: `curl http://localhost:5002/api/notes/recent`

---

## 🧪 Testing

### Manual Testing Commands
```bash
# Test backend health
curl http://localhost:5002/api/health

# Test frontend proxy
curl http://localhost:5173/api/health

# Check port usage
netstat -ano | findstr :5002
netstat -ano | findstr :5173

# Test MongoDB connection
# (Check server logs when starting)
```

### Frontend Testing
1. Open http://localhost:5173
2. Upload an image file
3. Check OCR extraction
4. Verify AI note generation
5. Test note management features

### API Testing
Use tools like Postman or curl to test:
- File upload endpoints
- OCR processing
- Note CRUD operations

---

## 🛠️ Development Tools

### Debug Files Created
- **`minimal-server.js`** - Basic Express server test
- **`server-no-db.js`** - Full server without MongoDB
- **`test-connection.html`** - Frontend connection tester

### Useful Development Commands
```bash
# Install all dependencies
npm run install:all

# Run both servers
npm run dev

# Run individual servers
npm run server:dev
npm run client:dev

# Build for production
npm run build

# Lint code
cd client && npm run lint
```

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

---

## 🚨 Emergency Fallback

If standard ports don't work, use alternative configuration:

### Backend (.env)
```env
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Vite Config Update
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

---

## 📊 Performance Monitoring

### Development Metrics
- Server startup time
- MongoDB connection time
- Frontend build time
- API response times
- OCR processing time

### Logging
- Server logs: Console output with timestamps
- Frontend logs: Browser developer console
- Database logs: MongoDB Atlas monitoring

---

## 🔄 Development Workflow

1. **Start Development**:
   ```bash
   npm run dev
   ```

2. **Make Changes**:
   - Backend: Auto-restart with nodemon
   - Frontend: Hot reload with Vite

3. **Test Changes**:
   - Use browser developer tools
   - Check server console logs
   - Test API endpoints

4. **Debug Issues**:
   - Follow debugging guide above
   - Use development tools
   - Check logs and error messages

5. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push
   ```

---

## 📞 Getting Help

If you encounter issues not covered here:

1. Check the [README.md](README.md) for general information
2. Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Look at existing issues in the GitHub repository
4. Create a new issue with detailed error information

Remember to include:
- Error messages
- Console logs
- Environment details
- Steps to reproduce