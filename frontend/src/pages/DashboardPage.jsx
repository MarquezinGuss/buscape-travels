// src/pages/DashboardPage.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { tripAPI } from "../lib/api";
import CreateTripModal from "../components/CreateTripModal";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data } = await tripAPI.list();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">
            ✈️ buscapé<span className="text-coral-500">Travels</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:block">
              Olá, <strong className="text-white">{user?.name?.split(" ")[0]}</strong>
            </span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">
              Suas viagens
            </h2>
            <p className="text-slate-400 mt-1">
              Organize gastos e acompanhe quem pagou o quê
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
            + Nova viagem
          </button>
        </div>

        {/* Lista de viagens */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-32 animate-pulse bg-navy-800/50" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🗺️</span>
            <h3 className="font-display text-xl font-bold mt-4 text-white">
              Nenhuma viagem ainda
            </h3>
            <p className="text-slate-400 mt-2">
              Crie a primeira viagem e convide a família!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary mt-6"
            >
              Criar primeira viagem
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, i) => (
              <Link
                to={`/trips/${trip.id}`}
                key={trip.id}
                className="animate-item block card hover:border-coral-500/40 hover:bg-navy-700/50 
                           transition-all duration-200 cursor-pointer group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-coral-400 transition-colors">
                        {trip.name}
                      </h3>
                      <span className="badge bg-navy-700 text-slate-400">
                        📍 {trip.destination}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {format(new Date(trip.startDate), "dd MMM", { locale: ptBR })} →{" "}
                      {format(new Date(trip.endDate), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      {trip.members.slice(0, 4).map((m) => (
                        <div
                          key={m.user.id}
                          className="w-7 h-7 rounded-full bg-coral-500/20 border border-coral-500/30
                                     flex items-center justify-center text-xs font-bold text-coral-400"
                        >
                          {m.user.name[0].toUpperCase()}
                        </div>
                      ))}
                      {trip.members.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-navy-700 border border-navy-600
                                        flex items-center justify-center text-xs text-slate-400">
                          +{trip.members.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      {trip._count.expenses} gasto{trip._count.expenses !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(["trips"]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
