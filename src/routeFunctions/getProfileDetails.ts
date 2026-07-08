import type { Request, Response } from "express";
import type { Pool } from "../types/customTypes.js";

export async function getUserProfile(req: Request, res: Response, pool: Pool): Promise<void> {
    const profileId = req.params.id;

    try {
      // Fetch base profile data
      const [profileRows]: any = await pool.query(
        "SELECT full_name, email, about_me, github_url, linkedin_url, twitter_url FROM profiles WHERE profile_id = ?",
        [profileId]
      );

      if (profileRows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      // Fetch user specific skills using our optimized INNER JOIN bridge
      const [skillRows]: any = await pool.query(
        `SELECT s.skill_name 
             FROM skills s 
             INNER JOIN profile_skills ps ON s.skill_id = ps.skill_id
             WHERE ps.profile_id = ?`,
        [profileId]
      );

      const skills = skillRows.map((row: any) => row.skill_name);

      res.json({
        ...profileRows[0],
        skills
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }