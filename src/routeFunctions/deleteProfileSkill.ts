import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool, Skill } from "../types/customTypes.js";
import type { Request, Response } from "express";
import { fetchProfileAndSkills } from "../helperFuntions/fetchProfileAndSkills.js";

export async function deleteProfileSkill(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { skillId } = req.body;
  const profileId = req.params.id;
  console.log(skillId, profileId)

  if (typeof profileId !== "string") {
    res.status(400).json({ error: "Invalid profile ID" });
    return;
  }

  if (!skillId || typeof skillId !== "string" || !skillId.trim() || skillId === "undefined") {
    res
      .status(400)
      .json({ error: "SkillId must be a valid, non-empty string" });
    return;
  }

  try {
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
