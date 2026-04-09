// src/controllers/payment.controller.js
// Controla as parcelas: marcar como pago/pendente

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── PATCH /api/payments/:id/pay ──────────────────────────
// Marca uma parcela como PAGA
// Cada usuário só pode marcar as próprias parcelas
export async function markAsPaid(req, res) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { expense: true },
    });

    if (!payment) return res.status(404).json({ error: "Parcela não encontrada." });

    // Verifica se é a parcela do próprio usuário
    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: "Você só pode marcar suas próprias parcelas." });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({ error: "Esta parcela já está marcada como paga." });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error("[markAsPaid]", err);
    return res.status(500).json({ error: "Erro ao marcar parcela como paga." });
  }
}

// ─── PATCH /api/payments/:id/unpay ────────────────────────
// Reverte uma parcela para PENDENTE (caso tenha errado)
export async function markAsUnpaid(req, res) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: "Parcela não encontrada." });
    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: "Você só pode alterar suas próprias parcelas." });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: "PENDING", paidAt: null },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error("[markAsUnpaid]", err);
    return res.status(500).json({ error: "Erro ao reverter pagamento." });
  }
}

// ─── GET /api/payments/user/:tripId ───────────────────────
// Retorna todas as parcelas do usuário logado em uma viagem
// Útil para a tela "Meu resumo" — o coração do app!
export async function getMyPayments(req, res) {
  try {
    const { tripId } = req.params;

    const payments = await prisma.payment.findMany({
      where: {
        userId: req.user.id,
        expense: { tripId },
      },
      include: {
        expense: {
          select: { id: true, title: true, type: true, category: true, date: true },
        },
      },
      orderBy: { expense: { date: "desc" } },
    });

    // Calcula o progresso total: X/Y parcelas pagas
    const total = payments.length;
    const paid = payments.filter((p) => p.status === "PAID").length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidAmount = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return res.json({
      payments,
      summary: {
        progress: `${paid}/${total}`,  // ex: "2/6"
        paid,
        total,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paidAmount: parseFloat(paidAmount.toFixed(2)),
        remainingAmount: parseFloat((totalAmount - paidAmount).toFixed(2)),
      },
    });
  } catch (err) {
    console.error("[getMyPayments]", err);
    return res.status(500).json({ error: "Erro ao buscar parcelas." });
  }
}
