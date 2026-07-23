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

  // 1. Define base pool options without the `ssl` key
  const poolOptions: mysql.PoolOptions = {
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    idleTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  // 2. Only add `ssl` if running in production
  if (process.env.NODE_ENV === "production") {
    poolOptions.ssl = {
      rejectUnauthorized: false
    };
  }

  const pool = mysql.createPool(poolOptions);

  globalThis.__dbPool = pool;

  return pool;
}
