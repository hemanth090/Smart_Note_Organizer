# Smart Notes Organizer

A full-stack MERN application that uses OCR (Optical Character Recognition) and AI to extract text from images and generate organized, intelligent notes.

## Features

- 📸 **Image Upload & OCR**: Upload images and extract text using Tesseract.js
- 🤖 **AI-Powered Note Generation**: Transform extracted text into organized notes using AI
- 📝 **Note Management**: Create, read, update, and delete notes
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- 🔒 **Secure**: Environment-based configuration and secure file handling

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Icons** - Icon library
- **React Dropzone** - File upload component

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Tesseract.js** - OCR library
- **Groq SDK** - AI integration
- **Multer** - File upload middleware

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mernSmartNote
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## Environment Setup

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smartnotes
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartnotes

# AI Service (Groq)
GROQ_API_KEY=your_groq_api_key_here

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. **Start the server** (from the `server` directory):
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the client** (from the `client` directory):
   ```bash
   npm run dev
   ```
   The client will run on `http://localhost:5173`

### Production Mode

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**:
   ```bash
   cd ../server
   npm start
   ```

## API Endpoints

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### OCR
- `POST /api/ocr/extract` - Extract text from uploaded image
- `POST /api/ocr/generate-notes` - Generate AI-powered notes from text

## Project Structure

```
mernSmartNote/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├─��� models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── uploads/         # File uploads directory
│   └── package.json
├── .gitignore
└── README.md
```

## Usage

1. **Upload an Image**: Use the file upload interface to select an image containing text
2. **Extract Text**: The OCR service will automatically extract text from the image
3. **Generate Notes**: AI will process the extracted text and create organized notes
4. **Manage Notes**: View, edit, and delete your notes through the interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your Atlas connection string
   - Verify the `MONGODB_URI` in your `.env` file

2. **OCR Not Working**
   - Check if the uploaded image is clear and contains readable text
   - Ensure Tesseract.js dependencies are properly installed

3. **AI Notes Generation Failing**
   - Verify your `GROQ_API_KEY` is valid and has sufficient credits
   - Check the API endpoint configuration

4. **CORS Issues**
   - Ensure `CLIENT_URL` in server `.env` matches your frontend URL
   - Check that both servers are running on the correct ports

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.