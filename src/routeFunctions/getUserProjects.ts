import type { Pool } from "../types/customTypes.js";
import type { Request, Response } from "express";

export async function getUserProjects(
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> {
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
