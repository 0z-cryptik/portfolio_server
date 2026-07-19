import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import type { Pool } from "../types/customTypes.js";
import { fetchProfileAndSkills } from "../helperFuntions/fetchProfileAndSkills.js";

export async function updateUserProfile(
  req: Request,
  res: Response,
  pool: Pool
) {
  const profileId = req.params.id;
  const { field, newValue } = req.body;

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

  if (typeof profileId !== "string") {
    res
      .status(400)
      .json({ error: "Invalid type! profile_id is not a string" });
    return;
  }

  const allowedFields = [
    "full_name",
    "email",
    "about_me",
    "skills",
    "github_url",
    "linkedin_url",
    "twitter_url"
  ];

  if (!allowedFields.includes(field)) {
    res.status(400).json({ error: "Invalid field" });
    return;
  }

  try {
    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE profiles SET ${field} = ? WHERE profile_id = ?`,
      [newValue.trim(), profileId]
    );

    if (updateResult.affectedRows === 0) {
      res
        .status(400)
        .json({ error: "Update failed: Profile record not found." });
      return;
    }

    const updatedResult = await fetchProfileAndSkills(pool, profileId);

    res.status(200).json(updatedResult);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
    console.error(error);
  }
}
