# Quick Setup Guide

This guide will help you get the Smart Notes Organizer up and running quickly.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd mernSmartNote
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Configure your environment**:
   Edit `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smart-notes-organizer
   GROQ_API_KEY=your_groq_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

   This will start both the server (port 5000) and client (port 5173).

## Alternative Setup

If you prefer to run servers separately:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

## Getting API Keys

### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/login
3. Create a new API key
4. Add it to your `server/.env` file

## Troubleshooting

- **MongoDB connection issues**: Ensure MongoDB is running or check your Atlas connection string
- **Port conflicts**: Change ports in environment files if needed
- **Missing dependencies**: Run `npm run install:all` again

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review the API endpoints in the README

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Run both client and server in development mode
npm run dev

# Run only server in development mode
npm run server:dev

# Run only client in development mode
npm run client:dev

# Build client for production
npm run build

# Start server in production mode
npm start
```