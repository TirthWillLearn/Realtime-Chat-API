import fs from "fs";
import path from "path";
import { pool } from "./db";

// runs SQL migration file against the database
const runMigration = async () => {
  try {
    // read raw SQL from file
    const sql = fs.readFileSync(
      path.join(__dirname, "../migrations/init.sql"),
      "utf8",
    );

    // execute migration query
    await pool.query(sql);

    console.log("Migration executed successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    // close DB connection after migration
    await pool.end();
  }
};

runMigration();
