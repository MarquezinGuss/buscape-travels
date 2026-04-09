// src/components/AddMemberModal.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tripAPI } from "../lib/api";

export default function AddMemberModal({ tripId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => tripAPI.addMember(tripId, email),
    onSuccess: () => {
      toast.success("Membro adicionado! 🎉");
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Erro ao adicionar membro."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Informe o e-mail do membro.");
    mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-navy-900 border border-navy-700 rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">👥 Adicionar membro</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          O membro precisa ter uma conta no buscapéTravels. Informe o e-mail cadastrado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">E-mail do membro</label>
            <input
              type="email"
              className="input"
              placeholder="familiar@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={isPending}>
              {isPending ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
