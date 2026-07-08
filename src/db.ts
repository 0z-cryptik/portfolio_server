import mysql from "mysql2/promise";
import dotenv from "dotenv";
import type { Pool } from "./types/customTypes.js";

dotenv.config();

// We check if a connection pool already exists globally to prevent
// serverless functions from creating duplicates on every single invocation.
let pool: Pool;

export function getDatabasePool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      // This accommodates both your local string or your live Aiven.io URI string
      uri:
        process.env.DATABASE_URL ||
        "mysql://Enitan:Enitan0@127.0.0.1:3306/my_database",
      waitForConnections: true,
      connectionLimit: 3, // Keep this low so Vercel instances don't choke your free DB tier
      queueLimit: 0,
      idleTimeout: 10000 // Close idle connections after 10 seconds to free up slots
    });
  }
  return pool;
}
