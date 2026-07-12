import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import { getUserProjects } from "./getUserProjects.js";

export async function updateProject(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { field, newValue, projectId } = req.body;

  if (!field) {
    res.status(400).json({ error: "No specified field" });
    return;
  }

  if (!newValue) {
    res.status(400).json({ error: "New value is an empty string" });
    return;
  }

  if (typeof newValue !== "string") {
    res
      .status(400)
      .json({ error: "Invalid Type! new value is not a string" });
    return;
  }

  if (typeof field !== "string") {
    res.status(400).json({ error: "Invalid Type! field is not a string" });
    return;
  }

  if (typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid type! profile_id is not a string" });
    return;
  }

  const allowedFields = ["title", "description"];

  if (!allowedFields.includes(field)) {
    res.status(400).json({ error: "Invalid field" });
    return;
  }

  try {
    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE projects SET ${field} = ? WHERE project_id = ?`,
      [newValue.trim(), projectId]
    );

    if (updateResult.affectedRows === 0) {
      res
        .status(400)
        .json({ error: "Update failed: Profile record not found." });
      return;
    }

    getUserProjects(req, res, pool);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
    console.error(error);
  }
}
