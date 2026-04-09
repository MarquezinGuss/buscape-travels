// src/pages/TripPage.jsx
// Página principal da viagem: gastos, membros e progresso de pagamentos

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import { tripAPI, paymentAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import AddExpenseModal from "../components/AddExpenseModal";
import AddMemberModal from "../components/AddMemberModal";
import PaymentProgress from "../components/PaymentProgress";

// Formata valor em BRL
const money = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

const CATEGORY_ICONS = {
  hospedagem: "🏠", alimentação: "🍽️", passeio: "🎡",
  transporte: "🚗", compras: "🛍️", outros: "📦",
};

export default function TripPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("gastos"); // "gastos" | "membros" | "meu-resumo"
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Busca todos os detalhes da viagem
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const { data } = await tripAPI.getById(id);
      return data;
    },
  });

  // Busca minhas parcelas nesta viagem
  const { data: myData } = useQuery({
    queryKey: ["myPayments", id],
    queryFn: async () => {
      const { data } = await paymentAPI.getMyPayments(id);
      return data;
    },
  });

  // Marcar parcela como paga/pendente
  const togglePayment = useMutation({
    mutationFn: async ({ paymentId, isPaid }) => {
      if (isPaid) return paymentAPI.markAsUnpaid(paymentId);
      return paymentAPI.markAsPaid(paymentId);
    },
    onSuccess: (_, { isPaid }) => {
      toast.success(isPaid ? "Parcela revertida" : "Parcela marcada como paga! ✅");
      queryClient.invalidateQueries(["trip", id]);
      queryClient.invalidateQueries(["myPayments", id]);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Erro ao atualizar parcela."),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-coral-500 animate-pulse font-display text-2xl">✈️ Carregando...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-slate-400">Viagem não encontrada.</p>
        <Link to="/" className="btn-secondary">← Voltar</Link>
      </div>
    );
  }

  const myPayments = myData?.payments ?? [];
  const mySummary = myData?.summary;

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            ← Voltar
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-white truncate">{trip.name}</h1>
            <p className="text-slate-400 text-xs">
              📍 {trip.destination} ·{" "}
              {format(new Date(trip.startDate), "dd MMM", { locale: ptBR })} –{" "}
              {format(new Date(trip.endDate), "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Resumo rápido do topo */}
        {mySummary && (
          <div className="card mb-6 bg-gradient-to-r from-coral-500/10 to-navy-800 border-coral-500/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-slate-400 text-sm">Meu saldo pendente</p>
                <p className="font-display text-2xl font-bold text-white">
                  {money(mySummary.remainingAmount)}
                </p>
              </div>
              <PaymentProgress paid={mySummary.paid} total={mySummary.total} large />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-900 p-1 rounded-xl mb-6">
          {[
            { key: "gastos", label: "💸 Gastos" },
            { key: "membros", label: "👥 Membros" },
            { key: "meu-resumo", label: "📊 Meu Resumo" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? "bg-coral-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: GASTOS ── */}
        {tab === "gastos" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Gastos da viagem</h2>
              <button onClick={() => setShowAddExpense(true)} className="btn-primary">
                + Gasto
              </button>
            </div>

            {trip.expenses.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl">💸</span>
                <p className="text-slate-400 mt-3">Nenhum gasto lançado ainda.</p>
                <button onClick={() => setShowAddExpense(true)} className="btn-primary mt-4">
                  Lançar primeiro gasto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {trip.expenses.map((expense, i) => {
                  const myPayment = expense.payments.find((p) => p.userId === user?.id);
                  return (
                    <div key={expense.id} className="animate-item card" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <span className="text-2xl mt-0.5">
                            {CATEGORY_ICONS[expense.category] || "📦"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white">{expense.title}</h3>
                              <span className={`badge ${
                                expense.type === "BASE"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}>
                                {expense.type === "BASE" ? "Geral" : "Individual"}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mt-0.5">
                              Adiantado por{" "}
                              <strong className="text-slate-300">{expense.payer.name.split(" ")[0]}</strong>
                              {" · "}
                              {format(new Date(expense.date), "dd/MM/yyyy")}
                            </p>
                            {/* Progresso de quem pagou */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {expense.payments.map((p) => (
                                <div
                                  key={p.id}
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                                    p.status === "PAID"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-navy-700 text-slate-400"
                                  }`}
                                >
                                  {p.status === "PAID" ? "✅" : "⏳"}{" "}
                                  {p.user.name.split(" ")[0]} · {money(p.amount)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-white">
                            {money(expense.amount)}
                          </p>
                          {myPayment && (
                            <button
                              onClick={() =>
                                togglePayment.mutate({
                                  paymentId: myPayment.id,
                                  isPaid: myPayment.status === "PAID",
                                })
                              }
                              className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 ${
                                myPayment.status === "PAID"
                                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                  : "bg-coral-500/10 text-coral-400 hover:bg-coral-500/20"
                              }`}
                            >
                              {myPayment.status === "PAID" ? "✅ Pago" : "Marcar pago"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MEMBROS ── */}
        {tab === "membros" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Membros</h2>
              <button onClick={() => setShowAddMember(true)} className="btn-primary">
                + Membro
              </button>
            </div>

            <div className="space-y-3">
              {trip.summary?.map((s, i) => (
                <div key={s.user.id} className="animate-item card" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-coral-500/20 border border-coral-500/30
                                    flex items-center justify-center font-display font-bold text-coral-400 text-lg shrink-0">
                      {s.user.name[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{s.user.name}</p>
                        {s.user.id === trip.creatorId && (
                          <span className="badge bg-coral-500/10 text-coral-400">criador</span>
                        )}
                        {s.user.id === user?.id && (
                          <span className="badge bg-navy-700 text-slate-400">você</span>
                        )}
                      </div>
                      <PaymentProgress paid={s.progress.paid} total={s.progress.total} />
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-white">{money(s.totalDue)}</p>
                      <p className={`text-sm font-semibold ${
                        s.balance <= 0 ? "text-green-400" : "text-coral-400"
                      }`}>
                        {s.balance <= 0 ? "✅ Quitado" : `Deve ${money(s.balance)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: MEU RESUMO ── */}
        {tab === "meu-resumo" && (
          <div>
            <h2 className="font-display text-lg font-bold mb-4">Minhas parcelas</h2>

            {mySummary && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="card text-center">
                  <p className="text-slate-400 text-xs mb-1">Total devido</p>
                  <p className="font-display font-bold text-white">{money(mySummary.totalAmount)}</p>
                </div>
                <div className="card text-center">
                  <p className="text-slate-400 text-xs mb-1">Já paguei</p>
                  <p className="font-display font-bold text-green-400">{money(mySummary.paidAmount)}</p>
                </div>
                <div className="card text-center">
                  <p className="text-slate-400 text-xs mb-1">Pendente</p>
                  <p className="font-display font-bold text-coral-400">{money(mySummary.remainingAmount)}</p>
                </div>
              </div>
            )}

            {myPayments.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-4xl">🎉</span>
                <p className="text-slate-400 mt-2">Nenhuma parcela ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPayments.map((p, i) => (
                  <div key={p.id} className="animate-item card flex items-center justify-between gap-3"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div>
                      <p className="font-semibold text-white">{p.expense.title}</p>
                      <p className="text-slate-400 text-sm">
                        {format(new Date(p.expense.date), "dd/MM/yyyy")}
                        {" · "}
                        <span className={`font-semibold ${
                          p.expense.type === "BASE" ? "text-blue-400" : "text-amber-400"
                        }`}>
                          {p.expense.type === "BASE" ? "Geral" : "Individual"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-display font-bold text-white">{money(p.amount)}</p>
                      <button
                        onClick={() =>
                          togglePayment.mutate({
                            paymentId: p.id,
                            isPaid: p.status === "PAID",
                          })
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 ${
                          p.status === "PAID"
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "bg-coral-500 text-white hover:bg-coral-600"
                        }`}
                      >
                        {p.status === "PAID" ? "✅ Pago" : "Pagar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modais */}
      {showAddExpense && (
        <AddExpenseModal
          tripId={id}
          members={trip.members}
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(["trip", id]);
            queryClient.invalidateQueries(["myPayments", id]);
            setShowAddExpense(false);
          }}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          tripId={id}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(["trip", id]);
            setShowAddMember(false);
          }}
        />
      )}
    </div>
  );
}
