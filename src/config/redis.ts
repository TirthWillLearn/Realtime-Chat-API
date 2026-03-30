import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // load Redis config from .env

// initialize Redis client (used for caching + presence tracking)
export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379, // default Redis port
  db: 0, // use default DB (can be changed if needed)
});

// log successful connection (helps during startup/debugging)
redis.on("connect", () => console.log("Redis connected"));

// log errors (connection issues, auth problems, etc.)
redis.on("error", (err) => console.error("Redis error:", err));
