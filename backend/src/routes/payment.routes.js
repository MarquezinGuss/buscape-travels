// src/routes/payment.routes.js
import { Router } from "express";
import {
  markAsPaid,
  markAsUnpaid,
  getMyPayments,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.patch("/:id/pay", markAsPaid);                   // PATCH /api/payments/:id/pay
router.patch("/:id/unpay", markAsUnpaid);               // PATCH /api/payments/:id/unpay
router.get("/user/:tripId", getMyPayments);             // GET   /api/payments/user/:tripId

export default router;
