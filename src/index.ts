import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { setupSocket } from "./socket/index";
import "./config/redis"; // initialize Redis connection on server start
import uploadRouter from "./routes/upload.route";
import authRouter from "./routes/auth.route";

dotenv.config(); // load environment variables

const app = express();

// create HTTP server explicitly so Socket.io can attach to it
const httpServer = createServer(app);

// attach Socket.io to the HTTP server
const io = new Server(httpServer, {});

app.use(express.json()); // parse JSON request bodies

// serve uploaded files statically (used for image sharing)
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    service: "Realtime Chat API",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",

    description:
      "Backend API for a real-time chat application with Socket.io, JWT authentication, PostgreSQL, Redis caching, and image sharing",

    server: {
      uptime: process.uptime(),
      timestamp: new Date(),
    },

    author: {
      name: "Tirth Patel",
      linkedin: "https://www.linkedin.com/in/tirth-k-patel",
      github: "https://github.com/TirthWillLearn",
    },

    auth: {
      register: {
        method: "POST",
        path: "/api/auth/register",
        description: "Register a new user and receive JWT token",
      },
      login: {
        method: "POST",
        path: "/api/auth/login",
        description: "Login and receive JWT token",
      },
    },

    socket: {
      connection: {
        url: "https://realtime-chat-api-78gu.onrender.com",
        auth: "Pass JWT via handshake auth token or Authorization header",
      },
      events: {
        joinRoom: "Join a chat room by room ID",
        leaveRoom: "Leave a chat room",
        sendMessage: "Send a message to a room",
        joinDM: "Start a private DM with another user",
      },
    },

    uploads: {
      image: {
        method: "POST",
        path: "/api/uploads",
        description: "Upload an image and receive a URL",
        limit: "2MB",
        formats: "jpg, png, gif, webp",
      },
    },

    meta: {
      repository: "https://github.com/TirthWillLearn/Realtime-Chat-App",
      documentation: "See README.md on GitHub",
    },
  });
});
// file upload routes (Multer handling)
app.use("/api", uploadRouter);

// authentication routes (login/register, JWT)
app.use("/api/auth", authRouter);

// initialize all socket event handlers
setupSocket(io);

// start server (use env port for production)
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
