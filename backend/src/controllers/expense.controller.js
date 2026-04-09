// src/controllers/expense.controller.js
// Criação de gastos e geração automática de parcelas (payments)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── POST /api/expenses ───────────────────────────────────
// Cria um gasto e já divide automaticamente entre os participantes
export async function createExpense(req, res) {
  try {
    const { tripId, title, description, amount, type, category, date, participantIds } = req.body;

    if (!tripId || !title || !amount || !type) {
      return res.status(400).json({ error: "tripId, título, valor e tipo são obrigatórios." });
    }

    // Verifica se o usuário é membro da viagem
    const isMember = await prisma.tripMember.findFirst({
      where: { tripId, userId: req.user.id },
    });
    if (!isMember) return res.status(403).json({ error: "Você não faz parte desta viagem." });

    // Busca os membros que vão dividir o gasto:
    // BASE → todos os membros da viagem
    // INDIVIDUAL → apenas os IDs passados no body
    let membersToSplit;

    if (type === "BASE") {
      const allMembers = await prisma.tripMember.findMany({ where: { tripId } });
      membersToSplit = allMembers.map((m) => m.userId);
    } else {
      if (!participantIds || participantIds.length === 0) {
        return res.status(400).json({ error: "Para gastos individuais, informe os participantes." });
      }
      membersToSplit = participantIds;
    }

    // Divide o valor igualmente entre os participantes
    const totalAmount = parseFloat(amount);
    const splitAmount = parseFloat((totalAmount / membersToSplit.length).toFixed(2));

    // Ajuste de arredondamento: o primeiro participante absorve a diferença de centavos
    const remainder = parseFloat(
      (totalAmount - splitAmount * membersToSplit.length).toFixed(2)
    );

    // Cria o gasto e os payments em uma única transação
    const expense = await prisma.expense.create({
      data: {
        tripId,
        title,
        description,
        amount: totalAmount,
        type,
        category,
        date: date ? new Date(date) : new Date(),
        payerId: req.user.id, // quem lançou/adiantou
        payments: {
          create: membersToSplit.map((userId, index) => ({
            userId,
            // O primeiro paga o resto do arredondamento
            amount: index === 0 ? splitAmount + remainder : splitAmount,
            status: "PENDING",
          })),
        },
      },
      include: {
        payer: { select: { id: true, name: true, avatar: true } },
        payments: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error("[createExpense]", err);
    return res.status(500).json({ error: "Erro ao criar gasto." });
  }
}

// ─── GET /api/expenses/:tripId ────────────────────────────
// Lista todos os gastos de uma viagem
export async function getExpensesByTrip(req, res) {
  try {
    const { tripId } = req.params;

    const isMember = await prisma.tripMember.findFirst({
      where: { tripId, userId: req.user.id },
    });
    if (!isMember) return res.status(403).json({ error: "Acesso negado." });

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: {
        payer: { select: { id: true, name: true, avatar: true } },
        payments: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return res.json(expenses);
  } catch (err) {
    console.error("[getExpensesByTrip]", err);
    return res.status(500).json({ error: "Erro ao listar gastos." });
  }
}

// ─── DELETE /api/expenses/:id ─────────────────────────────
// Deleta um gasto (apenas quem lançou pode deletar)
export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return res.status(404).json({ error: "Gasto não encontrado." });
    if (expense.payerId !== req.user.id) {
      return res.status(403).json({ error: "Apenas quem lançou pode deletar este gasto." });
    }

    await prisma.expense.delete({ where: { id } });
    return res.json({ message: "Gasto deletado com sucesso." });
  } catch (err) {
    console.error("[deleteExpense]", err);
    return res.status(500).json({ error: "Erro ao deletar gasto." });
  }
}
