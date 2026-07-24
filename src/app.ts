import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { Request, Response } from "express";
import { getDatabasePool } from "./db.js";
import { getUserProfile } from "./routeFunctions/getProfileDetails.js";
import { getUserProjects } from "./routeFunctions/getUserProjects.js";
import { updateUserProfile } from "./routeFunctions/updateUserProfile.js";
import { addNewSkill } from "./routeFunctions/addNewSkill.js";
import { deleteProfileSkill } from "./routeFunctions/deleteProfileSkill.js";
import { updateProject } from "./routeFunctions/updateProject.js";
import { addProjectSkill } from "./routeFunctions/addProjectSkill.js";
import { deleteProjectSkill } from "./routeFunctions/deleteProjectSkill.js";
import { addNewProject } from "./routeFunctions/addNewProject.js";
import { deleteProject } from "./routeFunctions/deleteProject.js";
import { reorderProjects } from "./routeFunctions/reorderProjects.js";
import { requireAdminSecret } from "./routeFunctions/checkAdminKey.js";

const app = express();
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENTLINKS
      ? process.env.CLIENTLINKS.split(",")
      : ["http://localhost:5173"]
  })
);
app.use(express.json());

const pool = getDatabasePool();

// PROFILE
app.get("/api/profile/:id", (req: Request, res: Response) => {
  getUserProfile(req, res, pool);
});

app.get("/api/profile/:id/projects", (req: Request, res: Response) => {
  getUserProjects(req, res, pool);
});

app.put(
  "/api/profile/:id/",
  requireAdminSecret,
  (req: Request, res: Response) => {
    updateUserProfile(req, res, pool);
  }
);

app.post(
  "/api/profile/:id/skills",
  requireAdminSecret,
  (req: Request, res: Response) => {
    addNewSkill(req, res, pool);
  }
);

app.delete(
  "/api/profile/:id/skills",
  requireAdminSecret,
  (req: Request, res: Response) => {
    deleteProfileSkill(req, res, pool);
  }
);

// PROJECTS
app.put(
  "/api/profile/:id/projects",
  requireAdminSecret,
  (req: Request, res: Response) => {
    updateProject(req, res, pool);
  }
);

app.post(
  "/api/profile/:id/projects/skills",
  requireAdminSecret,
  (req: Request, res: Response) => {
    addProjectSkill(req, res, pool);
  }
);

app.delete(
  "/api/profile/:id/projects/skills",
  requireAdminSecret,
  (req: Request, res: Response) => {
    deleteProjectSkill(req, res, pool);
  }
);

app.post(
  "/api/profile/:id/projects",
  requireAdminSecret,
  (req: Request, res: Response) => {
    addNewProject(req, res, pool);
  }
);

app.delete(
  "/api/profile/:id/projects",
  requireAdminSecret,
  (req: Request, res: Response) => {
    deleteProject(req, res, pool);
  }
);

app.put(
  "/api/projects/reorder",
  requireAdminSecret,
  (req: Request, res: Response) => {
    reorderProjects(req, res, pool);
  }
);

// Fallback
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
