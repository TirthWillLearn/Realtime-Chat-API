import { pool } from "../config/db";
import { redis } from "../config/redis";

// save message to DB (source of truth)
export const saveMessage = async (
  room_id: number,
  user_id: number,
  message: string,
) => {
  const result = await pool.query(
    `INSERT INTO messages (room_id, user_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, room_id, user_id, message, created_at`,
    [room_id, user_id, message],
  );
  return result.rows[0];
};

// fetch messages from DB (used as fallback if cache is empty)
export const getMessages = async (room_id: number) => {
  const result = await pool.query(
    `SELECT id, room_id, user_id, message, created_at
     FROM messages
     WHERE room_id = $1
     ORDER BY created_at ASC`,
    [room_id],
  );
  return result.rows;
};

// cache latest messages in Redis
export const cacheMessage = async (room_id: number, message: string) => {
  const key = `room:${room_id}:messages`;

  // store message as JSON for consistency with DB result
  await redis.lpush(key, JSON.stringify(message));

  // keep only last 50 messages
  await redis.ltrim(key, 0, 49);
};

// get cached messages (fallback to DB if empty)
export const getCachedMessages = async (room_id: number) => {
  const key = `room:${room_id}:messages`;

  const messages = await redis.lrange(key, 0, -1);

  if (messages.length === 0) {
    // fallback to DB if cache miss
    return await getMessages(room_id);
  }

  // parse cached JSON messages
  return messages.map((msg) => JSON.parse(msg));
};
