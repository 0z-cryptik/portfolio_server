import type { Pool, Profile, Skill } from "../types/customTypes.js";

async function fetchProfile(
  pool: Pool,
  profileId: string
): Promise<Profile[]> {
  const [profileRows] = await pool.query<Profile[]>(
    "SELECT full_name, email, about_me, github_url, linkedin_url, twitter_url FROM profiles WHERE profile_id = ?",
    [profileId]
  );

  return profileRows;
}

async function fetchSkills(
  pool: Pool,
  profileId: string
): Promise<Skill[]> {
  const [skillRows] = await pool.query<Skill[]>(
    `SELECT s.skill_name 
        FROM skills s INNER JOIN profile_skills ps
        ON s.skill_id = ps.skill_id
        WHERE ps.profile_id = ?`,
    [profileId]
  );

  return skillRows;
}

export async function fetchProfileAndSkills(
  pool: Pool,
  profileId: string
) {
  const [profiles, skills] = await Promise.all([
    fetchProfile(pool, profileId),
    fetchSkills(pool, profileId)
  ]);

  if (profiles.length === 0) {
    throw new Error("No profile matches that ID");
  }

  return {
    ...profiles[0],
    skills
  };
}
