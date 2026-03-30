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
