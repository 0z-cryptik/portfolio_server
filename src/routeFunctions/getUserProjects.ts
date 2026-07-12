import type { Pool, Project, Skill } from "../types/customTypes.js";
import type { Request, Response } from "express";

export async function getUserProjects(
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> {
  const profileId = req.params.id;

  try {
    const [projects] = await pool.query<Project[]>(
      "SELECT project_id, title, description, repo_link, live_link FROM projects WHERE profile_id = ?",
      [profileId]
    );

    if (projects.length === 0) {
      res.json([]);
      return;
    }

    const [projectSkills]: any = await pool.query(
      `SELECT ps.project_id, s.skill_name 
             FROM project_skills ps INNER JOIN skills s 
             ON ps.skill_id = s.skill_id
             WHERE ps.project_id IN (?)`,
      [projects.map((p: Project) => `${p.project_id}`)]
    );

    // Map the flat skill rows into their corresponding project objects
    const projectsWithSkills = projects.map((project: Project) => {
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
        skills: skillNamesOnly
      };
    });

    res.json(projectsWithSkills);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
