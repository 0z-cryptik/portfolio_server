import mysql from "mysql2/promise";
import dotenv from "dotenv";
import type { Pool } from "./types/customTypes.js";

dotenv.config();

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

export function getDatabasePool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  if (globalThis.__dbPool) {
    return globalThis.__dbPool;
  }

  // 1. Strip `ssl-mode` or other incompatible query parameters from the URI string
  const cleanUri = process.env.DATABASE_URL.replace(/[\?&]ssl-mode=[^&]*/gi, "");

  // 2. Define pool options optimized for Vercel Serverless
  const poolOptions: mysql.PoolOptions = {
    uri: cleanUri,
    waitForConnections: true,
    connectionLimit: 2,         // Keep connection count low for serverless
    queueLimit: 0,
    connectTimeout: 10000,      // Timeout connection attempts after 10s
    maxIdle: 1,                 // Immediately close unused idle connections
    idleTimeout: 30000          // Close idle connections after 30 seconds
  };

  // 3. Attach SSL explicitly in production
  if (process.env.NODE_ENV === "production") {
    poolOptions.ssl = {
      rejectUnauthorized: false
    };
  }

  const pool = mysql.createPool(poolOptions);

  globalThis.__dbPool = pool;

  return pool;
}