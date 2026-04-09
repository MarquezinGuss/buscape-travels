// src/app.js
// Configuração principal do Express

import express from "express";
import cors from "cors";
import "dotenv/config";

// Rotas
import authRoutes from "./routes/auth.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

// ─── Middlewares globais ───────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);       // /api/auth/register, /api/auth/login
app.use("/api/trips", tripRoutes);      // /api/trips (CRUD de viagens)
app.use("/api/expenses", expenseRoutes); // /api/expenses (gastos)
app.use("/api/payments", paymentRoutes); // /api/payments (marcar como pago)

// ─── Health check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "✈️ buscapéTravels API funcionando!" });
});

// ─── Tratamento de erros global ───────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
  });
});

export default app;
