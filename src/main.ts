import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { getDatabasePool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const pool = getDatabasePool();

app.get(
  "/api/profile/:id",
  async (req: Request, res: Response): Promise<void> => {
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
);


app.get(
  "/api/profile/:id/projects",
  async (req: Request, res: Response): Promise<void> => {
    const profileId = req.params.id;

    try {
      // Fetch all projects for this user
      const [projects]: any = await pool.query(
        "SELECT project_id, title, description, repo_link, live_link FROM projects WHERE profile_id = ?",
        [profileId]
      );

      // If the user has no projects, return a clean empty array
      if (projects.length === 0) {
        res.json([]);
        return;
      }

      // To keep things perfectly normalized without firing queries in a heavy loop,
      // we fetch ALL skill mappings for this user's projects in one clean single join execution
      const [projectSkills]: any = await pool.query(
        `SELECT ps.project_id, s.skill_name 
             FROM project_skills ps INNER JOIN skills s 
             ON ps.skill_id = s.skill_id
             WHERE ps.project_id IN (?)`,
        [projects.map((p: any) => p.project_id)]
      );

      // Map the flat skill rows into their corresponding project objects
      const projectsWithSkills = projects.map((project: any) => {
        // STEP 1: Filter out ONLY the rows belonging to this specific project
        const matchingSkillRows = projectSkills.filter((ps: any) => {
          return ps.project_id === project.project_id;
        });

        // STEP 2: Extract just the string names from those matching rows
        const skillNamesOnly = matchingSkillRows.map((ps: any) => {
          return ps.skill_name;
        });

        // STEP 3: Combine everything into the final project object
        return {
          ...project,
          tech_stack: skillNamesOnly
        };
      });

      res.json(projectsWithSkills);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Local development backend running on http://localhost:${PORT}`
  );
});

export default app;