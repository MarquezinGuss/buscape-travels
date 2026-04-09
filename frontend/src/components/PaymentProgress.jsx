// src/components/PaymentProgress.jsx
// Componente de progresso de pagamentos — ex: 2/6 com barra visual

export default function PaymentProgress({ paid, total, large = false }) {
  const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
  const isComplete = paid === total && total > 0;

  return (
    <div className={large ? "w-full" : ""}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-semibold ${large ? "text-base" : "text-xs"} ${
          isComplete ? "text-green-400" : "text-slate-300"
        }`}>
          {isComplete ? "✅ " : ""}
          {paid}/{total} parcelas pagas
        </span>
        <span className={`${large ? "text-sm" : "text-xs"} text-slate-500`}>
          {percentage}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className={`bg-navy-700 rounded-full overflow-hidden ${large ? "h-2.5" : "h-1.5"}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? "bg-green-500" : "bg-coral-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
