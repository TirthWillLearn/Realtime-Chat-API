import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // load DB credentials from .env

// create a connection pool (reused across queries)
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // convert port to number (env vars are strings)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
