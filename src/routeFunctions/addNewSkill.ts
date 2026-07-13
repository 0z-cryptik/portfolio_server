import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import type { Request, Response } from "express";
import { fetchProfileAndSkills } from "../helperFuntions/fetchProfileAndSkills.js";

export async function addNewSkill(
  req: Request,
  res: Response,
  pool: Pool
) {
  const profileId = req.params.id;
  const { newSkill } = req.body;

  if (typeof profileId !== "string") {
    res.status(400).json({ error: "Invalid profile ID" });
    return;
  }

  if (!newSkill || typeof newSkill !== "string" || !newSkill.trim()) {
    res
      .status(400)
      .json({ error: "Skill name must be a valid, non-empty string" });
    return;
  }

  try {
    let skillId: number;

    const [existingSkill] = await pool.query<RowDataPacket[]>(
      `SELECT skill_id FROM skills WHERE skill_name = ?`,
      [newSkill.trim()]
    );

    // skill already exist
    if (existingSkill.length > 0 && typeof existingSkill[0] !== "undefined") {
      skillId = existingSkill[0].skill_id;
    } else {
      const [newlyCreatedSkill] = await pool.query<ResultSetHeader>(
        `INSERT INTO skills (skill_name) VALUES (?)`,
        [newSkill.trim()]
      );
      skillId = newlyCreatedSkill.insertId;
    }

    // check if the skill is already linked to the user
    const [existingLink] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM profile_skills WHERE skill_id = ? AND profile_id = ?",
      [skillId, profileId]
    );

    if (existingLink.length > 0) {
      res.status(400).json({ error: "This user already has this skill" });
      return;
    }

    await pool.query(
      `INSERT INTO profile_skills (skill_id, profile_id) VALUES (?, ?)`,
      [skillId, profileId]
    );

    const updatedProfile = await fetchProfileAndSkills(pool, profileId);

    res.status(200).json(updatedProfile);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Internal Server Error" });
  }
}
