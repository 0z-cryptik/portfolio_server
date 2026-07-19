import { getUserProjects } from "./getUserProjects.js";
import type { Request, Response } from "express";
import type { Pool } from "../types/customTypes.js";
import type { ResultSetHeader } from "mysql2";

interface NewProjectDetails {
  projectName: string;
  description: string;
  liveLink?: string;
  backendRepoLink?: string;
  repoLink: string;
  seeHowItWorks?: string;
  skillIds: number[];
  showOnCV: boolean;
}

export async function addNewProject(
  req: Request,
  res: Response,
  pool: Pool
) {
  const profileId = req.params.id;

  if (!profileId || typeof profileId !== "string") {
    res.status(400).json({ error: "profile Id is not a valid string" });
    return;
  }

  const newProjectDetails: NewProjectDetails = req.body;
  const { projectName, description, repoLink, showOnCV } =
    newProjectDetails;

  console.log(newProjectDetails);

  const [trimmedProjectName, trimmedDescription, trimmedRepoLink] = [
    projectName.trim(),
    description.trim(),
    repoLink.trim()
  ];

  const missingRequiredDetails =
    !trimmedDescription || !trimmedProjectName || !trimmedRepoLink;

  if (missingRequiredDetails) {
    res.status(400).json({ error: "Required details cannot be empty" });
    return;
  }

  const backendRepo = newProjectDetails.backendRepoLink?.trim() || "";
  const seeHowItWorks = newProjectDetails.seeHowItWorks?.trim() || "";
  const liveLink = newProjectDetails.liveLink?.trim() || "";

  try {
    const columns = ["title", "description", "repo_link", "profile_id"];
    const placeholders = ["?", "?", "?", "?"];
    const values: (string | number)[] = [
      trimmedProjectName,
      trimmedDescription,
      trimmedRepoLink,
      profileId
    ];

    if (typeof showOnCV === "boolean") {
      let value = showOnCV ? 1 : 0;
      columns.push("show_on_cv");
      placeholders.push("?");
      values.push(value);
    }

    if (backendRepo) {
      columns.push("backend_repo");
      placeholders.push("?");
      values.push(backendRepo);
    }

    if (seeHowItWorks) {
      columns.push("see_how_it_works");
      placeholders.push("?");
      values.push(seeHowItWorks);
    }

    if (liveLink) {
      columns.push("live_link");
      placeholders.push("?");
      values.push(liveLink);
    }

    const [newlyCreatedProject] = await pool.query<ResultSetHeader>(
      `INSERT INTO projects (${columns.join(", ")}) 
    VALUES (${placeholders.join(", ")})`,
      values
    );

    const projectId = newlyCreatedProject.insertId;
    const skillsAndProjectIds = newProjectDetails.skillIds.map(
      (skillId) => [skillId, projectId]
    );

    // bulk insert
    await pool.query(
      `INSERT INTO project_skills (skill_id, project_id) VALUES ?`,
      [skillsAndProjectIds]
    );

    getUserProjects(req, res, pool);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Error creating project" });
  }
}
