# Sticky Notes - Backend API

This is the backend server for the Sticky Notes application. It provides a RESTful API and WebSocket connections for real-time collaboration.

## Tech Stack
- **Node.js** & **Express**
- **MongoDB** with **Mongoose**
- **Socket.IO** (for real-time cursors and collaborative editing)
- **JWT** (JSON Web Tokens for authentication)
- **Cloudinary** (for profile picture uploads)
- **TypeScript**

## Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Run in development mode (with hot-reloading):
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Start production server:
```bash
npm start
```
