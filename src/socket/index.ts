import { Server } from "socket.io";
import {
  saveMessage,
  cacheMessage,
  getCachedMessages,
} from "../service/message.service";
import { redis } from "../config/redis";
import { authMiddleware } from "../middleware/auth.middleware";

export const setupSocket = (io: Server) => {
  // authenticate socket connection during handshake (JWT validation)
  io.use(authMiddleware);

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // mark user as online with TTL (auto-expires if client crashes)
    redis.set(`user:${socket.data.user_id}:status`, "online", "EX", 30);

    socket.on("joinRoom", async (roomNo) => {
      try {
        // join room for group messaging
        socket.join(roomNo);

        // notify others in the room (exclude sender)
        socket.to(roomNo).emit("message", `Someone joined ${roomNo}`);

        // fetch recent messages from Redis cache
        const result = await getCachedMessages(roomNo);

        // send cached messages only to the newly joined client
        socket.emit("message", result);
      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leaveRoom", (roomNo) => {
      // leave the room (no broadcast needed here)
      socket.leave(roomNo);
    });

    socket.on("sendMessage", async (roomNo, message) => {
      try {
        // persist message in DB first (source of truth)
        const result = await saveMessage(roomNo, socket.data.user_id, message);

        // cache message in Redis for faster future reads
        await cacheMessage(roomNo, message);

        // broadcast saved message to all users in the room (including sender)
        io.to(roomNo).emit("message", result);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("joinDM", (targetUserId) => {
      // create deterministic room name so both users always land in same DM
      const dmRoom = `dm:${Math.min(socket.data.user_id, targetUserId)}:${Math.max(socket.data.user_id, targetUserId)}`;

      socket.join(dmRoom);

      console.log(`DM room: ${dmRoom}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      // remove online status (TTL already acts as fallback if this doesn't fire)
      redis.del(`user:${socket.data.user_id}:status`);
    });
  });
};
