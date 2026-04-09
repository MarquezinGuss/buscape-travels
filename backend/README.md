# ✈️ buscapéTravels — Backend

API REST para gerenciamento de viagens em família: gastos compartilhados, divisão de valores e controle de pagamentos.

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado e rodando

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com sua DATABASE_URL e JWT_SECRET
```

### 3. Criar o banco e rodar migrations
```bash
npm run db:migrate
```

### 4. Rodar o servidor em desenvolvimento
```bash
npm run dev
# Servidor em http://localhost:3333
```

---

## 📡 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário logado |

### Viagens
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/trips` | Criar viagem |
| GET | `/api/trips` | Listar minhas viagens |
| GET | `/api/trips/:id` | Detalhes + resumo financeiro |
| POST | `/api/trips/:id/members` | Adicionar membro por email |
| DELETE | `/api/trips/:id` | Deletar viagem |

### Gastos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/expenses` | Criar gasto (divide automaticamente) |
| GET | `/api/expenses/:tripId` | Listar gastos da viagem |
| DELETE | `/api/expenses/:id` | Deletar gasto |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| PATCH | `/api/payments/:id/pay` | Marcar parcela como paga |
| PATCH | `/api/payments/:id/unpay` | Reverter para pendente |
| GET | `/api/payments/user/:tripId` | Minhas parcelas + progresso (ex: 2/6) |

---

## 🧩 Tipos de gasto

- **BASE** → dividido igualmente entre *todos* os membros da viagem (ex: Airbnb)
- **INDIVIDUAL** → dividido entre *membros selecionados* (ex: passeio opcional)

---

## 🗄️ Banco de dados

```
User ──< TripMember >── Trip
                         │
                      Expense
                         │
                       Payment
```
