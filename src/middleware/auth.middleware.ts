import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

export const authMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  // extract token from auth payload, query, or headers
  const token =
    socket.handshake.auth.token ||
    socket.handshake.query.token ||
    socket.handshake.headers.authorization?.replace("Bearer ", "");

  // basic validation
  if (!token || typeof token !== "string") {
    return next(new Error("Authentication error"));
  }

  // ensure secret is available
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }

  try {
    // verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
    };

    // attach user info to socket context
    socket.data.user_id = decoded.id;

    next();
  } catch (err) {
    // reject connection if token is invalid or expired
    next(new Error("Authentication error"));
  }
};
