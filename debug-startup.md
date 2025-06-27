# Debug Startup Guide

## Step 1: Test Minimal Server

First, let's test if the basic server works:

```bash
cd server
node minimal-server.js
```

Expected output:
```
🚀 Minimal server running on http://localhost:5002
🌐 Test URLs:
   - http://localhost:5002/
   - http://localhost:5002/api
   - http://localhost:5002/api/health
   - http://localhost:5002/api/test-connection
```

**Test in browser:** Open http://localhost:5002/api/health
- If this works: Basic Express setup is fine
- If this fails: There's a fundamental issue with Node.js/Express

## Step 2: Test Server Without Database

If Step 1 works, test the server without MongoDB:

```bash
cd server
node server-no-db.js
```

Expected output:
```
🚀 Smart Notes Organizer server (No DB) running on port 5002
📝 Environment: development
🌐 API URL: http://localhost:5002/api
🔗 Client URL: http://localhost:5173
🧪 Test connection: http://localhost:5002/api/test-connection
```

**Test in browser:** Open http://localhost:5002/api/test-connection
- If this works: The issue is with MongoDB connection
- If this fails: There's an issue with the Express configuration

## Step 3: Test Frontend Connection

Open the connection test page:
```
Open: client/test-connection.html in your browser
```

This will test all the API endpoints and show you exactly where the connection fails.

## Step 4: Test Full Server

If Steps 1-3 work, try the full server:

```bash
cd server
npm run dev
```

Watch for:
- MongoDB connection messages
- Any error messages
- Port binding confirmation

## Step 5: Test Frontend

If the backend is running successfully:

```bash
cd client
npm run dev
```

Then open http://localhost:5173

## Common Issues and Solutions:

### Issue: Port Already in Use
```bash
# Find process using port 5002
netstat -ano | findstr :5002

# Kill the process (replace PID with actual process ID)
taskkill /F /PID [PID]
```

### Issue: MongoDB Connection Failed
- Check if MongoDB Atlas is accessible
- Verify the connection string in .env
- Try running server-no-db.js to bypass MongoDB

### Issue: CORS Errors
- Check browser console for CORS errors
- Verify frontend is running on port 5173
- Check backend CORS configuration

### Issue: Environment Variables
- Verify .env files exist in both client and server directories
- Check VITE_API_URL in client/.env
- Check PORT in server/.env

## Debug Commands:

```bash
# Check if ports are free
netstat -ano | findstr :5002
netstat -ano | findstr :5173

# Kill all Node processes
taskkill /F /IM node.exe

# Test API directly
curl http://localhost:5002/api/health
curl http://localhost:5002/api/test-connection
```