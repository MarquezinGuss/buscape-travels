# ✈️ buscapéTravels — Frontend

Interface React para gerenciamento de viagens em família.

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Backend rodando em `http://localhost:3333`

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em desenvolvimento
```bash
npm run dev
# Abre em http://localhost:5173
```

### 3. Build para produção
```bash
npm run build
```

---

## 🗂️ Estrutura de páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | LoginPage | Tela de login |
| `/register` | RegisterPage | Criar conta |
| `/` | DashboardPage | Lista de viagens do usuário |
| `/trips/:id` | TripPage | Detalhes: gastos, membros, meu resumo |

## 🧩 Componentes principais

| Componente | Descrição |
|------------|-----------|
| `PaymentProgress` | Barra de progresso X/Y parcelas |
| `CreateTripModal` | Modal para criar nova viagem |
| `AddExpenseModal` | Modal para lançar gasto (BASE ou INDIVIDUAL) |
| `AddMemberModal` | Modal para convidar membro por e-mail |

## 🎨 Design system

- **Fontes**: Syne (títulos) + Plus Jakarta Sans (corpo)
- **Cor primária**: Coral `#F97316`
- **Background**: Navy `#060C1A`
- **Framework CSS**: Tailwind CSS

## ⚙️ Proxy de desenvolvimento

O `vite.config.js` já está configurado para redirecionar
chamadas `/api/*` para `http://localhost:3333`, então não
é necessário configurar CORS em desenvolvimento.
