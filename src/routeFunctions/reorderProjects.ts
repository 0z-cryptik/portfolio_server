import type { Request, Response } from "express";
import type { Pool } from "../types/customTypes.js";

interface ReorderPayload {
  orders: {
    projectId: number;
    displayOrder: number;
  }[];
}

export async function reorderProjects(
  req: Request,
  res: Response,
  pool: Pool
) {
  const { orders }: ReorderPayload = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    res.status(400).json({ error: "Invalid order payload" });
    return;
  }

  const connection = await pool.getConnection();

  try {
    // 1. Start Transaction
    await connection.beginTransaction();

    // 2. Build dynamic bulk UPDATE SQL using SQL CASE statements
    // UPDATE projects SET display_order = CASE id WHEN 12 THEN 1 WHEN 5 THEN 2 END WHERE id IN (12, 5)
    const caseStatements: string[] = [];
    const projectIds: number[] = [];
    const queryParams: number[] = [];

    orders.forEach(({ projectId, displayOrder }) => {
      caseStatements.push("WHEN ? THEN ?");
      queryParams.push(projectId, displayOrder);
      projectIds.push(projectId);
    });

    // 3. Combine params for both CASE values and WHERE IN values
    await connection.query(
      `
      UPDATE projects 
      SET display_order = CASE project_id ${caseStatements.join(" ")} END
      WHERE project_id IN (${projectIds.map(() => "?").join(",")})
    `,
      [...queryParams, ...projectIds]
    );

    // 4. Commit transaction
    await connection.commit();

    res
      .status(200)
      .json({ message: "Project order updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error reordering projects:", error);
    res.status(500).json({ error: "Failed to update project order" });
  } finally {
    connection.release();
  }
}
