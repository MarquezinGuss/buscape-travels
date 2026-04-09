// src/components/AddExpenseModal.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { expenseAPI } from "../lib/api";

const CATEGORIES = [
  { value: "hospedagem", label: "🏠 Hospedagem" },
  { value: "alimentação", label: "🍽️ Alimentação" },
  { value: "passeio",    label: "🎡 Passeio" },
  { value: "transporte", label: "🚗 Transporte" },
  { value: "compras",    label: "🛍️ Compras" },
  { value: "outros",     label: "📦 Outros" },
];

export default function AddExpenseModal({ tripId, members, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", amount: "", type: "BASE",
    category: "outros", description: "", date: "",
  });
  // IDs dos participantes selecionados (para gastos INDIVIDUAL)
  const [selectedIds, setSelectedIds] = useState(members.map((m) => m.userId));

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleMember = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      expenseAPI.create({
        tripId,
        title: form.title,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        description: form.description,
        date: form.date || undefined,
        participantIds: form.type === "INDIVIDUAL" ? selectedIds : undefined,
      }),
    onSuccess: () => {
      toast.success("Gasto lançado! 💸");
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Erro ao lançar gasto."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error("Título e valor são obrigatórios.");
    if (parseFloat(form.amount) <= 0) return toast.error("Valor deve ser maior que zero.");
    if (form.type === "INDIVIDUAL" && selectedIds.length === 0) {
      return toast.error("Selecione ao menos um participante.");
    }
    mutate();
  };

  const splitAmount =
    form.amount && selectedIds.length > 0
      ? (parseFloat(form.amount) / (form.type === "BASE" ? members.length : selectedIds.length)).toFixed(2)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">💸 Novo gasto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de gasto */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "BASE",       label: "🌍 Geral",      desc: "Dividido por todos" },
              { key: "INDIVIDUAL", label: "🎯 Individual", desc: "Dividido por alguns" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setForm({ ...form, type: t.key })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.type === t.key
                    ? "border-coral-500 bg-coral-500/10 text-white"
                    : "border-navy-700 bg-navy-800 text-slate-400 hover:border-navy-600"
                }`}
              >
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="label">Título *</label>
            <input className="input" placeholder="Ex: Airbnb, Jantar, Ingresso..." value={form.title} onChange={set("title")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor total (R$) *</label>
              <input type="number" step="0.01" min="0.01" className="input" placeholder="0,00" value={form.amount} onChange={set("amount")} />
            </div>
            <div>
              <label className="label">Data</label>
              <input type="date" className="input" value={form.date} onChange={set("date")} />
            </div>
          </div>

          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Participantes (só para INDIVIDUAL) */}
          {form.type === "INDIVIDUAL" && (
            <div>
              <label className="label">Participantes</label>
              <div className="space-y-2">
                {members.map((m) => (
                  <label
                    key={m.userId}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedIds.includes(m.userId)
                        ? "border-coral-500/50 bg-coral-500/5"
                        : "border-navy-700 bg-navy-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.userId)}
                      onChange={() => toggleMember(m.userId)}
                      className="accent-coral-500"
                    />
                    <div className="w-7 h-7 rounded-full bg-coral-500/20 flex items-center justify-center
                                    text-xs font-bold text-coral-400">
                      {m.user.name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{m.user.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Preview da divisão */}
          {splitAmount && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-3 text-sm">
              <p className="text-slate-400">
                Cada pessoa pagará{" "}
                <strong className="text-coral-400 font-display">R$ {splitAmount}</strong>
                {" "}({form.type === "BASE" ? members.length : selectedIds.length} pessoas)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={isPending}>
              {isPending ? "Lançando..." : "Lançar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
