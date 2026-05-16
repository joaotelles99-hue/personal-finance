import { fmtValor } from "../utils";

export default function Header({ mesNome, totalPrevisto, totalRecebido, totalPendente, ocultarValores, onToggleOcultar, onResetarMes }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Topo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#27ae60", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>📅 {mesNome}</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>💪 Personal Finance</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onToggleOcultar} style={{ background: "#f5f5f5", border: "none", borderRadius: 10, padding: "9px 11px", fontSize: 16, lineHeight: 1, color: "#555" }}>
              {ocultarValores ? "🙈" : "👁️"}
            </button>
            <button onClick={onResetarMes} style={{ background: "#f5f5f5", border: "none", borderRadius: 10, padding: "9px 13px", fontSize: 12, fontWeight: 700, color: "#555" }}>
              Fechar Mês
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, paddingBottom: 18 }}>
          {[
            { label: "A Receber",  val: fmtValor(totalPrevisto,  ocultarValores), cor: "#111",     sub: "previsto" },
            { label: "Recebido",   val: fmtValor(totalRecebido,  ocultarValores), cor: "#27ae60",  sub: "confirmado" },
            { label: "Pendente",   val: fmtValor(totalPendente,  ocultarValores), cor: "#e53935",  sub: "em aberto" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fafafa", borderRadius: 14, padding: "12px 14px", border: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c.cor, letterSpacing: -0.3, lineHeight: 1 }}>{c.val}</div>
              <div style={{ fontSize: 9, color: "#ccc", marginTop: 3 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
