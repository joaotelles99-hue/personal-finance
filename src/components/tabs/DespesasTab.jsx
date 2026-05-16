import { useState, useMemo } from "react";
import { fmtValor, totalDespesasPagas, totalDespesasPrevistas } from "../../utils";
import { CATEGORIAS } from "../../constants";

const TIPO_CFG = {
  fixa:      { label: "Fixa",      bg: "#f0fdf4", cor: "#15803d" },
  parcelada: { label: "Parcelada", bg: "#eff6ff", cor: "#2563eb" },
  avulsa:    { label: "Avulsa",    bg: "#fffbeb", cor: "#d97706" },
};

const FILTROS = [
  { key: "todos",     label: "Todos" },
  { key: "fixa",      label: "Fixas" },
  { key: "parcelada", label: "Parceladas" },
  { key: "avulsa",    label: "Avulsas" },
];

export default function DespesasTab({ despesas, ocultarValores, onTogglePago, onToggleFixado, onEditar, onDeletar }) {
  const [filtro, setFiltro] = useState("todos");

  const fixadas   = useMemo(() => despesas.filter(d => d.fixado), [despesas]);
  const naoFixadas = useMemo(() => {
    const base = despesas.filter(d => !d.fixado);
    return filtro === "todos" ? base : base.filter(d => d.tipo === filtro);
  }, [despesas, filtro]);

  const pagas     = useMemo(() => totalDespesasPagas(despesas), [despesas]);
  const previstas = useMemo(() => totalDespesasPrevistas(despesas), [despesas]);

  if (despesas.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 48 }}>💸</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 14, color: "#111" }}>Nenhuma despesa</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>Toque em + para adicionar</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Pagas</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>{fmtValor(pagas, ocultarValores)}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Previstas</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626" }}>{fmtValor(previstas, ocultarValores)}</div>
        </div>
      </div>

      {/* Fixadas */}
      {fixadas.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>📌 Fixadas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {fixadas.map(d => <DCard key={d.id} d={d} ocultarValores={ocultarValores} onTogglePago={onTogglePago} onToggleFixado={onToggleFixado} onEditar={onEditar} onDeletar={onDeletar} />)}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
        {FILTROS.map(f => {
          const ativo = filtro === f.key;
          return (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600, border: "none",
              background: ativo ? "#111" : "#f3f4f6", color: ativo ? "#fff" : "#666", transition: "all 0.15s",
            }}>{f.label}</button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {naoFixadas.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: "#ccc", fontSize: 13 }}>Nenhuma aqui</div>}
        {naoFixadas.map(d => <DCard key={d.id} d={d} ocultarValores={ocultarValores} onTogglePago={onTogglePago} onToggleFixado={onToggleFixado} onEditar={onEditar} onDeletar={onDeletar} />)}
      </div>
    </div>
  );
}

function DCard({ d, ocultarValores, onTogglePago, onToggleFixado, onEditar, onDeletar }) {
  const tipoCfg = TIPO_CFG[d.tipo];
  const catCfg  = CATEGORIAS.find(c => c.id === d.categoria) ?? CATEGORIAS[CATEGORIAS.length - 1];

  return (
    <div style={{ background: "#fff", border: `1px solid ${d.pago ? "#bbf7d0" : "#f0f0f0"}`, borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button onClick={() => onTogglePago(d.id)} style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${d.pago ? "#22c55e" : "#e0e0e0"}`, background: d.pago ? "#22c55e" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, marginTop: 1 }}>
          {d.pago ? "✓" : ""}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{d.nome}</span>
            <span style={{ fontSize: 9, background: tipoCfg.bg, color: tipoCfg.cor, borderRadius: 5, padding: "2px 6px", fontWeight: 700, textTransform: "uppercase" }}>{tipoCfg.label}</span>
            {d.tipo === "parcelada" && (
              <span style={{ fontSize: 9, background: "#eff6ff", color: "#2563eb", borderRadius: 5, padding: "2px 6px", fontWeight: 700 }}>
                faltam {d.totalParcelas - d.parcelaAtual + 1}/{d.totalParcelas}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: catCfg.cor, color: catCfg.corTexto, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>{catCfg.label}</span>
            {d.conta && <span style={{ fontSize: 10, color: "#aaa", background: "#f9fafb", borderRadius: 5, padding: "2px 7px" }}>{d.conta}</span>}
            {d.diaVencimento && <span style={{ fontSize: 10, color: "#bbb" }}>dia {d.diaVencimento}</span>}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: d.pago ? "#15803d" : "#111" }}>{fmtValor(d.valor, ocultarValores)}</div>
          <div style={{ fontSize: 10, color: d.pago ? "#22c55e" : "#ccc", fontWeight: 600, marginTop: 2 }}>{d.pago ? "✓ pago" : "pendente"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={() => onToggleFixado(d.id)} style={{ background: "#f9fafb", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: d.fixado ? "#d97706" : "#bbb" }}>{d.fixado ? "📌 Fixado" : "Fixar"}</button>
        <button onClick={() => onEditar(d)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#555" }}>Editar</button>
        <button onClick={() => onDeletar(d.id)} style={{ background: "#fff5f5", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#ef4444" }}>Remover</button>
      </div>
    </div>
  );
}
