import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import { getUserProjects } from "./getUserProjects.js";

export async function updateShowOnCv(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { field, newValue, projectId } = req.body;

  if (!field) {
    res.status(400).json({ error: "No specified field" });
    return;
  }

  if (typeof newValue !== "boolean") {
    res
      .status(400)
      .json({ error: "Invalid Type! new value is not a boolean" });
    return;
  }

  if (typeof field !== "string") {
    res.status(400).json({ error: "Invalid Type! field is not a string" });
    return;
  }

  if (typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid type! project_id is not a string" });
    return;
  }

  const allowedFields = ["show_on_cv"];

  if (!allowedFields.includes(field)) {
    res.status(400).json({ error: "Invalid field" });
    return;
  }

  try {
    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE projects SET ${field} = ? WHERE project_id = ?`,
      [newValue, projectId]
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
