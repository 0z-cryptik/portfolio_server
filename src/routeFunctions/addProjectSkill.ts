import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Skill, Pool } from "../types/customTypes.js";
import { getUserProjects } from "./getUserProjects.js";

export async function addProjectSkill(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { newSkill, projectId } = req.body;

  if (!newSkill) {
    res.status(400).json({ error: "newSkill is an empty string" });
    return;
  }

  if (typeof newSkill !== "string") {
    res
      .status(400)
      .json({ error: "Invalid Type! newSkill is not a string" });
    return;
  }

  if (typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid type! projectId is not a string" });
    return;
  }

  try {
    let skillId: number;

    const [alreadyExistingSkill] = await pool.query<Skill[]>(
      "SELECT skill_id FROM skills WHERE skill_name = ?",
      [newSkill.trim()]
    );

    if (
      alreadyExistingSkill.length > 0 &&
      typeof alreadyExistingSkill[0] !== "undefined"
    ) {
      skillId = alreadyExistingSkill[0].skill_id;
    } else {
      const [newlyCreatedSkill] = await pool.query<ResultSetHeader>(
        `INSERT INTO skills (skill_name) values (?)`,
        [newSkill.trim()]
      );
      skillId = newlyCreatedSkill.insertId;
    }

    // check if the skill is already linked to the project
    const [existingLink] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM project_skills WHERE skill_id = ? AND project_id = ?",
      [`${skillId}`, projectId]
    );

    if (existingLink.length > 0) {
      res
        .status(400)
        .json({ error: "This skill is already linked to this project" });
      return;
    }

    await pool.query(
      `INSERT INTO project_skills (skill_id, project_id) VALUES (?, ?)`,
      [`${skillId}`, projectId]
    );

    getUserProjects(req, res, pool);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
    console.error(error);
  }
}
