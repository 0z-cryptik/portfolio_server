import { getUserProjects } from "./getUserProjects.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import type { Request, Response } from "express";

export async function deleteProjectSkill(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { skillId, projectId } = req.body;
  if (!skillId) {
    res.status(400).json({ error: "skillId is an empty string" });
    return;
  }

  if (typeof skillId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid Type! skillId is not a string" });
    return;
  }

  if (typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid type! projectId is not a string" });
    return;
  }

  try {
    const [deleteOperation] = await pool.query<ResultSetHeader>(
      `DELETE FROM project_skills WHERE skill_id = ? AND project_id = ?`,
      [skillId, projectId]
    );

    if (deleteOperation.affectedRows === 0) {
      res.status(500).json({ error: "Failed to delete skill" });
      return;
    }

    getUserProjects(req, res, pool);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete skill" });
  }
}
