import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { getDatabasePool } from "./db.js";
import { getUserProfile } from "./routeFunctions/getProfileDetails.js";
import { getUserProjects } from "./routeFunctions/getUserProjects.js";
import { updateUserProfile } from "./routeFunctions/updateUserProfile.js";
import { addNewSkill } from "./routeFunctions/addNewSkill.js";
import { deleteProfileSkill } from "./routeFunctions/deleteProfileSkill.js";

const app = express();
app.use(cors());
app.use(express.json());

const pool = getDatabasePool();

app.get("/api/profile/:id", (req: Request, res: Response) => {
  getUserProfile(req, res, pool);
});

app.get("/api/profile/:id/projects", (req: Request, res: Response) => {
  getUserProjects(req, res, pool);
});

app.put("/api/profile/:id/", (req: Request, res: Response) => {
  updateUserProfile(req, res, pool);
});

app.post("/api/profile/:id/skills", (req: Request, res: Response) => {
  addNewSkill(req, res, pool);
});

app.delete("/api/profile/:id/skills", (req: Request, res: Response) => {
  deleteProfileSkill(req, res, pool);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Local development backend running on http://localhost:${PORT}`
  );
});

export default app;
