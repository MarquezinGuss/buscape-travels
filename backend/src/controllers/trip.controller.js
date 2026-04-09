// src/controllers/trip.controller.js
// CRUD de viagens + gerenciamento de membros

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── POST /api/trips ──────────────────────────────────────
// Cria uma nova viagem e já adiciona o criador como membro
export async function createTrip(req, res) {
  try {
    const { name, destination, description, startDate, endDate, coverImage } = req.body;

    if (!name || !destination || !startDate || !endDate) {
      return res.status(400).json({ error: "Nome, destino e datas são obrigatórios." });
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        destination,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImage,
        creatorId: req.user.id,
        // Já adiciona o criador como membro automaticamente
        members: {
          create: { userId: req.user.id },
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      },
    });

    return res.status(201).json(trip);
  } catch (err) {
    console.error("[createTrip]", err);
    return res.status(500).json({ error: "Erro ao criar viagem." });
  }
}

// ─── GET /api/trips ───────────────────────────────────────
// Lista todas as viagens do usuário logado
export async function getTrips(req, res) {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        _count: { select: { expenses: true } },
      },
      orderBy: { startDate: "asc" },
    });

    return res.json(trips);
  } catch (err) {
    console.error("[getTrips]", err);
    return res.status(500).json({ error: "Erro ao listar viagens." });
  }
}

// ─── GET /api/trips/:id ───────────────────────────────────
// Busca uma viagem com todos os detalhes: membros, gastos e pagamentos
export async function getTripById(req, res) {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        members: { some: { userId: req.user.id } }, // só membros podem ver
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        expenses: {
          include: {
            payer: { select: { id: true, name: true, avatar: true } },
            payments: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!trip) return res.status(404).json({ error: "Viagem não encontrada." });

    // Calcula o resumo financeiro de cada membro
    const summary = trip.members.map((member) => {
      const totalDue = trip.expenses.reduce((sum, expense) => {
        const payment = expense.payments.find((p) => p.userId === member.userId);
        return sum + (payment ? Number(payment.amount) : 0);
      }, 0);

      const totalPaid = trip.expenses.reduce((sum, expense) => {
        const payment = expense.payments.find(
          (p) => p.userId === member.userId && p.status === "PAID"
        );
        return sum + (payment ? Number(payment.amount) : 0);
      }, 0);

      const payments = trip.expenses.flatMap((e) =>
        e.payments.filter((p) => p.userId === member.userId)
      );
      const paidCount = payments.filter((p) => p.status === "PAID").length;
      const totalCount = payments.length;

      return {
        user: member.user,
        totalDue,
        totalPaid,
        balance: totalDue - totalPaid, // quanto ainda deve
        progress: { paid: paidCount, total: totalCount }, // ex: 2/6
      };
    });

    return res.json({ ...trip, summary });
  } catch (err) {
    console.error("[getTripById]", err);
    return res.status(500).json({ error: "Erro ao buscar viagem." });
  }
}

// ─── POST /api/trips/:id/members ──────────────────────────
// Adiciona um membro à viagem pelo email
export async function addMember(req, res) {
  try {
    const { id: tripId } = req.params;
    const { email } = req.body;

    // Verifica se o usuário que adicionou é membro da viagem
    const isInTrip = await prisma.tripMember.findFirst({
      where: { tripId, userId: req.user.id },
    });
    if (!isInTrip) return res.status(403).json({ error: "Você não faz parte desta viagem." });

    // Busca o usuário pelo email
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: "Usuário não encontrado." });

    // Verifica se já é membro
    const alreadyMember = await prisma.tripMember.findFirst({
      where: { tripId, userId: userToAdd.id },
    });
    if (alreadyMember) return res.status(409).json({ error: "Usuário já é membro desta viagem." });

    const member = await prisma.tripMember.create({
      data: { tripId, userId: userToAdd.id },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return res.status(201).json(member);
  } catch (err) {
    console.error("[addMember]", err);
    return res.status(500).json({ error: "Erro ao adicionar membro." });
  }
}

// ─── DELETE /api/trips/:id ────────────────────────────────
// Deleta a viagem (apenas o criador pode)
export async function deleteTrip(req, res) {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: "Viagem não encontrada." });
    if (trip.creatorId !== req.user.id) {
      return res.status(403).json({ error: "Apenas o criador pode deletar a viagem." });
    }

    await prisma.trip.delete({ where: { id } });
    return res.json({ message: "Viagem deletada com sucesso." });
  } catch (err) {
    console.error("[deleteTrip]", err);
    return res.status(500).json({ error: "Erro ao deletar viagem." });
  }
}
