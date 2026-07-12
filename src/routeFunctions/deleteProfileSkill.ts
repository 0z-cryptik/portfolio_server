import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import type { Request, Response } from "express";
import { fetchProfileAndSkills } from "../helperFuntions/fetchProfileAndSkills.js";

export async function deleteProfileSkill(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { skillName } = req.body;
  const profileId = req.params.id;

  if (typeof profileId !== "string") {
    res.status(400).json({ error: "Invalid profile ID" });
    return;
  }

  if (!skillName || typeof skillName !== "string" || !skillName.trim()) {
    res
      .status(400)
      .json({ error: "Skill name must be a valid, non-empty string" });
    return;
  }

  try {
    const [skills] = await pool.query<RowDataPacket[]>(
      `SELECT skill_id FROM skills WHERE skill_name = ?`,
      [skillName.trim()]
    );

    if (skills.length === 0 || typeof skills[0] === "undefined") {
      res.status(404).json({ error: "Skill not found" });
      return;
    }

    const skillId = skills[0].skill_id;
    const [deleteOperationResult] = await pool.query<ResultSetHeader>(
      `DELETE FROM profile_skills WHERE skill_id = ?`,
      [skillId]
    );

    if (deleteOperationResult.affectedRows === 0) {
      res
        .status(404)
        .json({ error: "Couldn't find this skill under this user" });
      return;
    }

    const updatedProfile = await fetchProfileAndSkills(pool, profileId);
    res.status(200).json(updatedProfile);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Internal Server Error" });
  }
}
