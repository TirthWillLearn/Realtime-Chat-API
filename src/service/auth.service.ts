import { pool } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// helper to generate JWT
const generateToken = (userId: number) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // in production, prefer short-lived tokens + refresh tokens
  });
};

// register new user
export const registerUser = async (email: string, password: string) => {
  // check if user already exists
  const existingUser = await pool.query(
    `SELECT 1 FROM users WHERE email = $1`,
    [email],
  );

  if (existingUser.rowCount) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert user
  const result = await pool.query(
    `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`,
    [email, hashedPassword],
  );

  const user = result.rows[0];

  // generate token
  return generateToken(user.id);
};

// login existing user
export const loginUser = async (email: string, password: string) => {
  // fetch user
  const result = await pool.query(
    `SELECT id, password FROM users WHERE email = $1`,
    [email],
  );

  const user = result.rows[0];

  // avoid leaking whether email exists
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // generate token
  return generateToken(user.id);
};
