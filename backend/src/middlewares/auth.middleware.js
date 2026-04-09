// src/middlewares/auth.middleware.js
// Verifica se o token JWT é válido antes de acessar rotas protegidas

import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  // O token vem no header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injeta os dados do usuário na requisição para uso nos controllers
    req.user = decoded; // { id, name, email }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
