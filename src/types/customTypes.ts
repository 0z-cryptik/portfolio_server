import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

export type Pool = mysql.Pool;

export interface Profile extends RowDataPacket {
  full_name: string;
  email: string;
  about_me: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

export interface Skills extends RowDataPacket {
    skill_name: string;
}
