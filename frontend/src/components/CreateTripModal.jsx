// src/components/CreateTripModal.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tripAPI } from "../lib/api";

export default function CreateTripModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", destination: "", description: "",
    startDate: "", endDate: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const { mutate, isPending } = useMutation({
    mutationFn: () => tripAPI.create(form),
    onSuccess: () => {
      toast.success("Viagem criada! 🎉");
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Erro ao criar viagem."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.destination || !form.startDate || !form.endDate) {
      return toast.error("Preencha todos os campos obrigatórios.");
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return toast.error("A data de volta não pode ser antes da ida.");
    }
    mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">✈️ Nova viagem</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome da viagem *</label>
            <input className="input" placeholder="Ex: Férias em Floripa 2025" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label">Destino *</label>
            <input className="input" placeholder="Ex: Florianópolis, SC" value={form.destination} onChange={set("destination")} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input className="input" placeholder="Ex: Casa de praia com a família" value={form.description} onChange={set("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data de ida *</label>
              <input type="date" className="input" value={form.startDate} onChange={set("startDate")} />
            </div>
            <div>
              <label className="label">Data de volta *</label>
              <input type="date" className="input" value={form.endDate} onChange={set("endDate")} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={isPending}>
              {isPending ? "Criando..." : "Criar viagem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
