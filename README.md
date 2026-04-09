# ✈️ buscapéTravels

> Organize gastos de viagens em família — divida valores, acompanhe quem pagou e quanto falta.

Projeto fullstack construído com **React + Node.js + PostgreSQL**.

---

## 🏗️ Estrutura do projeto

```
buscape-travels/
├── backend/    # Node.js + Express + Prisma + PostgreSQL
└── frontend/   # React + Vite + TailwindCSS + React Query
```

---

## 🚀 Rodando o projeto completo

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado e rodando

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # Configure DATABASE_URL e JWT_SECRET
npm run db:migrate           # Cria as tabelas no banco
npm run dev                  # Inicia em http://localhost:3333
```

### 2. Frontend (em outro terminal)

```bash
cd frontend
npm install
npm run dev                  # Abre em http://localhost:5173
```

---

## 🔧 Variáveis de ambiente (backend/.env)

```env
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/buscape_travels"
JWT_SECRET="chave-secreta-forte-aqui"
JWT_EXPIRES_IN="7d"
PORT=3333
FRONTEND_URL="http://localhost:5173"
```

---

## ✨ Funcionalidades

- **Auth**: Cadastro e login com JWT
- **Viagens**: Criar, listar, ver detalhes
- **Membros**: Convidar por e-mail
- **Gastos**: Lançar gasto geral (todos dividem) ou individual (seleciona quem)
- **Divisão automática**: O backend divide o valor e cria parcelas para cada membro
- **Pagamentos**: Cada membro marca suas parcelas — progresso visual **2/6 pagas**
- **Dashboard financeiro**: Saldo devedor por membro, totais pagos e pendentes

---

## 🗄️ Modelo de dados

```
User ──< TripMember >── Trip
                         │
                      Expense  (BASE | INDIVIDUAL)
                         │
                       Payment  (PENDING | PAID)
```

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Estilização | Tailwind CSS |
| Estado servidor | TanStack React Query |
| Roteamento | React Router v6 |
| Backend | Node.js + Express |
| ORM | Prisma |
| Banco | PostgreSQL |
| Auth | JWT + bcrypt |
