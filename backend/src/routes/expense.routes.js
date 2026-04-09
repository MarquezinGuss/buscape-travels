// src/routes/expense.routes.js
import { Router } from "express";
import {
  createExpense,
  getExpensesByTrip,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createExpense);                    // POST   /api/expenses
router.get("/:tripId", getExpensesByTrip);          // GET    /api/expenses/:tripId
router.delete("/:id", deleteExpense);               // DELETE /api/expenses/:id

export default router;
