import type { Request, Response } from "express";
import type { Pool, Profile, Skill } from "../types/customTypes.js";
import type { RowDataPacket } from "mysql2";

export async function getUserProfile(req: Request, res: Response, pool: Pool){
    const profileId = req.params.id;

    try {
      const [profileRows] = await pool.query<Profile[]>(
        "SELECT full_name, email, about_me, github_url, linkedin_url, twitter_url FROM profiles WHERE profile_id = ?",
        [profileId]
      );

      if (profileRows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const [skills] = await pool.query<Skill[]>(
        `SELECT s.skill_name, s.skill_id 
             FROM skills s 
             INNER JOIN profile_skills ps ON s.skill_id = ps.skill_id
             WHERE ps.profile_id = ?`,
        [profileId]
      );

      //const skills = skillRows.map((row) => row.skill_name);

      res.json({
        ...profileRows[0],
        skills
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }