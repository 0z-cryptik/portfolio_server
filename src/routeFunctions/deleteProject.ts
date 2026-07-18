import { getUserProjects } from "./getUserProjects.js";
import type { Request, Response } from "express";
import type { Pool } from "../types/customTypes.js";

export async function deleteProject(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ error: "projectId is an empty string" });
    return;
  }

  if (typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid Type! projectId is not a string" });
    return;
  }

  try {
    await pool.query("DELETE FROM projects WHERE project_id = ?", [
      projectId
    ]);
    
    getUserProjects(req, res, pool);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e });
  }
}
