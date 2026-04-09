// src/routes/trip.routes.js
import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  addMember,
  deleteTrip,
} from "../controllers/trip.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas as rotas de viagem exigem autenticação
router.use(authMiddleware);

router.post("/", createTrip);                    // POST   /api/trips
router.get("/", getTrips);                       // GET    /api/trips
router.get("/:id", getTripById);                 // GET    /api/trips/:id
router.post("/:id/members", addMember);          // POST   /api/trips/:id/members
router.delete("/:id", deleteTrip);               // DELETE /api/trips/:id

export default router;
