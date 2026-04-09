// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Bem-vindo de volta! ✈️");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Fundo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-coral-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">✈️</span>
          <h1 className="font-display text-3xl font-bold text-white mt-2">
            buscapé<span className="text-coral-500">Travels</span>
          </h1>
          <p className="text-slate-400 mt-1">A viagem em família começa aqui</p>
        </div>

        {/* Card */}
        <div className="card animate-fade-in">
          <h2 className="font-display text-xl font-bold mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Não tem conta?{" "}
            <Link to="/register" className="text-coral-500 hover:text-coral-400 font-semibold transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
