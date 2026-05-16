import { useState, useMemo } from "react";
import { fmtValor, totalmentePago, valorRecebido, nomesDiv, getAlunoStatus } from "../../utils";

const hoje = new Date().getDate();

const STATUS_CFG = {
  "atrasado":        { label: "Atrasado",         dot: "#ef4444", bg: "#fff5f5", borda: "#fecaca" },
  "vence-em-breve":  { label: "Vence em breve",    dot: "#f59e0b", bg: "#fffbeb", borda: "#fde68a" },
  "em-dia":          { label: "Em dia",            dot: "#22c55e", bg: "#f0fdf4", borda: "#bbf7d0" },
};

const SAIDA_CFG = {
  "ativo":           null,
  "em-risco":        { label: "Em risco",          cor: "#f59e0b", bg: "#fffbeb" },
  "sai-este-mes":    { label: "Sai este mês",       cor: "#f97316", bg: "#fff7ed" },
  "sai-proximo-mes": { label: "Sai próximo mês",    cor: "#ef4444", bg: "#fff5f5" },
  "inativo":         { label: "Inativo",            cor: "#9ca3af", bg: "#f9fafb" },
};

const FILTROS = [
  { key: "todos",     label: "Todos" },
  { key: "atrasados", label: "Atrasados" },
  { key: "vence3",    label: "Vence em 3 dias" },
  { key: "em-dia",    label: "Em dia" },
];

export default function AlunosTab({ alunos, ocultarValores, onTogglePago, onTogglePago1, onTogglePago2, onEditar, onDeletar, pendencias, onPagarPendencia, onEditarObsPendencia }) {
  const [filtro, setFiltro] = useState("todos");

  const counts = useMemo(() => ({
    todos: alunos.length,
    atrasados: alunos.filter(a => getAlunoStatus(a, hoje) === "atrasado").length,
    vence3: alunos.filter(a => getAlunoStatus(a, hoje) === "vence-em-breve").length,
    "em-dia": alunos.filter(a => getAlunoStatus(a, hoje) === "em-dia").length,
  }), [alunos]);

  const lista = useMemo(() => {
    const sorted = [...alunos].sort((a, b) => a.vencimento - b.vencimento);
    if (filtro === "todos")     return sorted;
    if (filtro === "atrasados") return sorted.filter(a => getAlunoStatus(a, hoje) === "atrasado");
    if (filtro === "vence3")    return sorted.filter(a => getAlunoStatus(a, hoje) === "vence-em-breve");
    if (filtro === "em-dia")    return sorted.filter(a => getAlunoStatus(a, hoje) === "em-dia");
    return sorted;
  }, [alunos, filtro]);

  const pagosCount = alunos.filter(a => totalmentePago(a)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
        {FILTROS.map(f => {
          const ativo = filtro === f.key;
          return (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 50,
              fontSize: 12, fontWeight: 600, border: "none",
              background: ativo ? "#111" : "#f3f4f6",
              color: ativo ? "#fff" : "#666",
              transition: "all 0.15s",
            }}>
              {f.label} · {counts[f.key]}
            </button>
          );
        })}
      </div>

      {/* Contador */}
      <div style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>
        {pagosCount}/{alunos.length} pagos
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lista.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc" }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Nenhum aqui</div>
          </div>
        )}
        {lista.map(a => {
          const pendsAluno = (pendencias ?? []).filter(p => p.alunoId === a.id && !p.pago);
          return (
            <AlunoCard key={a.id} aluno={a} ocultarValores={ocultarValores}
              onTogglePago={onTogglePago} onTogglePago1={onTogglePago1} onTogglePago2={onTogglePago2}
              onEditar={onEditar} onDeletar={onDeletar}
              pendenciasAnteriores={pendsAluno}
              onPagarPendencia={onPagarPendencia} />
          );
        })}
      </div>
    </div>
  );
}

function AlunoCard({ aluno: a, ocultarValores, onTogglePago, onTogglePago1, onTogglePago2, onEditar, onDeletar, pendenciasAnteriores, onPagarPendencia }) {
  const status   = getAlunoStatus(a, hoje);
  const cfg      = STATUS_CFG[status];
  const saidaCfg = SAIDA_CFG[a.statusSaida ?? "ativo"];
  const rec      = valorRecebido(a);
  const totPago  = totalmentePago(a);
  const parcPago = !totPago && rec > 0;

  return (
    <div style={{ background: "#fff", border: `1px solid ${totPago ? "#bbf7d0" : "#f0f0f0"}`, borderRadius: 16, padding: "16px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Toggle individual */}
        {!a.dupla && (
          <button onClick={() => onTogglePago(a.id)} style={{
            width: 28, height: 28, borderRadius: "50%", border: `2px solid ${totPago ? "#22c55e" : "#e0e0e0"}`,
            background: totPago ? "#22c55e" : "#fff", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, marginTop: 2,
          }}>
            {totPago ? "✓" : ""}
          </button>
        )}
        {a.dupla && <div style={{ width: 28, flexShrink: 0 }} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111", letterSpacing: -0.2 }}>{a.nome}</span>
            {a.dupla && (
              <span style={{ fontSize: 9, background: "#eff6ff", color: "#2563eb", borderRadius: 5, padding: "2px 6px", fontWeight: 700, textTransform: "uppercase" }}>dupla</span>
            )}
            {saidaCfg && (
              <span style={{ fontSize: 9, background: saidaCfg.bg, color: saidaCfg.cor, borderRadius: 5, padding: "2px 6px", fontWeight: 700 }}>{saidaCfg.label}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Vence dia {a.vencimento}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: cfg.dot }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
              {cfg.label}
            </span>
          </div>
          {a.observacao && (
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 3, fontStyle: "italic" }}>{a.observacao}</div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: totPago ? "#15803d" : "#111", letterSpacing: -0.3 }}>{fmtValor(a.valor, ocultarValores)}</div>
          <div style={{ fontSize: 10, color: totPago ? "#22c55e" : parcPago ? "#22c55e" : "#ccc", fontWeight: 600, marginTop: 2 }}>
            {totPago ? "✓ Pago" : parcPago ? `${fmtValor(rec, ocultarValores)} rec.` : "pendente"}
          </div>
        </div>
      </div>

      {/* Checkboxes dupla */}
      {a.dupla && (() => {
        const [n1, n2] = nomesDiv(a.nome);
        const metade = a.valor / 2;
        return (
          <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
            {[
              { nome: n1, pago: a.pago1, toggle: () => onTogglePago1(a.id) },
              { nome: n2, pago: a.pago2, toggle: () => onTogglePago2(a.id) },
            ].map((p, i) => (
              <div key={i} onClick={p.toggle} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: p.pago ? "#f0fdf4" : "#fafafa", borderRadius: 10, padding: "10px 12px", cursor: "pointer", border: `1px solid ${p.pago ? "#bbf7d0" : "#f0f0f0"}`, transition: "all 0.15s" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: p.pago ? "#22c55e" : "#fff", border: `2px solid ${p.pago ? "#22c55e" : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, flexShrink: 0 }}>
                  {p.pago ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: p.pago ? "#22c55e" : "#aaa" }}>{fmtValor(metade, ocultarValores)}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Pendências anteriores */}
      {pendenciasAnteriores?.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f5f5f5" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Pendências anteriores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {pendenciasAnteriores.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff5f5", borderRadius: 8, padding: "7px 10px" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{p.mes}</div>
                  {p.observacao && <div style={{ fontSize: 10, color: "#aaa" }}>{p.observacao}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>{fmtValor(p.valorPendente, ocultarValores)}</span>
                  <button onClick={() => onPagarPendencia(p.id)} style={{ background: "#22c55e", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>Pago</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={() => onEditar(a)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#555" }}>Editar</button>
        <button onClick={() => onDeletar(a.id)} style={{ background: "#fff5f5", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#ef4444" }}>Remover</button>
      </div>
    </div>
  );
}
