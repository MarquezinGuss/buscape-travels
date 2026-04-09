// src/controllers/auth.controller.js
// Lógica de registro e login de usuários

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── POST /api/auth/register ──────────────────────────────
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    }

    // Verifica se o email já está cadastrado
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Este email já está cadastrado." });
    }

    // Criptografa a senha (salt 10 = bom equilíbrio segurança/performance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }, // nunca retorna a senha!
    });

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ error: "Erro ao criar conta." });
  }
}

// ─── POST /api/auth/login ─────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    // Compara a senha com o hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    // Gera o token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      token,
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ error: "Erro ao fazer login." });
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────
// Retorna os dados do usuário logado (útil para o frontend verificar a sessão)
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    return res.json(user);
  } catch (err) {
    console.error("[me]", err);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
}
