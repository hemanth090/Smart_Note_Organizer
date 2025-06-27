# Server Startup Instructions

## Current Configuration:
- **Backend Server**: http://localhost:5002
- **Frontend Server**: http://localhost:5173
- **API Base URL**: http://localhost:5002/api

## To Start the Application:

### 1. Start Backend Server:
```bash
cd server
npm run dev
```
**Expected Output:**
```
🚀 Smart Notes Organizer server running on port 5002
📝 Environment: development
🌐 API URL: http://localhost:5002/api
🔗 Client URL: http://localhost:5173
📊 MongoDB Connected: [your-mongodb-host]
🗄️ Database: test
```

### 2. Start Frontend Server (in a new terminal):
```bash
cd client
npm run dev
```
**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Access the Application:
Open your browser and go to: **http://localhost:5173**

## Troubleshooting:

### If Backend Fails to Start:
1. Check if port 5002 is in use: `netstat -ano | findstr :5002`
2. Kill any process using the port: `taskkill /PID [PID] /F`
3. Check MongoDB connection in the logs
4. Verify .env file has correct values

### If Frontend Can't Connect:
1. Ensure backend is running on port 5002
2. Check browser console for CORS errors
3. Verify VITE_API_URL in client/.env is set to `http://localhost:5002/api`

### If Recent Notes Are Empty:
1. Process an image first to create a note
2. Check browser console for API call logs
3. Test the endpoint: `curl http://localhost:5002/api/notes/recent`