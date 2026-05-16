import { useState, useMemo } from "react";
import { fmtValor, fmt, parseBRL } from "../../utils";
import { DIVISAO, CATEGORIAS } from "../../constants";

const MODOS_RESERVA = [
  { key: "fixo",       label: "Valor fixo",     sub: "Ex: R$4.000 por mês" },
  { key: "percentual", label: "Percentual",      sub: "Ex: 20% da receita" },
  { key: "maior",      label: "O maior",         sub: "% ou fixo, o maior" },
  { key: "menor",      label: "O menor",         sub: "% ou fixo, o menor" },
];

export default function DivisaoTab({ totalRecebido, despesas, orcamento, ocultarValores, onAtualizarOrcamento, reserva, onAtualizarReserva, reservaInfo }) {
  const [editandoMeta,    setEditandoMeta]    = useState(null);
  const [metaInput,       setMetaInput]       = useState("");
  const [editandoReserva, setEditandoReserva] = useState(false);
  const [sepInput,        setSepInput]        = useState("");

  const gastoPorCat = useMemo(() => {
    const map = {};
    for (const d of despesas) map[d.categoria] = (map[d.categoria] ?? 0) + d.valor;
    return map;
  }, [despesas]);

  const getMeta = (id) => orcamento.find(o => o.categoria === id)?.meta ?? 0;

  const salvarMeta = (catId) => {
    const v = parseBRL(metaInput);
    const novo = orcamento.filter(o => o.categoria !== catId);
    if (v > 0) novo.push({ categoria: catId, meta: v });
    onAtualizarOrcamento(novo);
    setEditandoMeta(null); setMetaInput("");
  };

  const salvarSeparado = () => {
    const v = parseBRL(sepInput);
    if (v >= 0) onAtualizarReserva({ ...reserva, separado: v });
    setEditandoReserva(false); setSepInput("");
  };

  const catsAtivas = useMemo(() => {
    const ids = new Set([...despesas.map(d => d.categoria), ...orcamento.map(o => o.categoria)]);
    return CATEGORIAS.filter(c => ids.has(c.id));
  }, [despesas, orcamento]);

  const { meta, separado, falta, pct } = reservaInfo ?? { meta: 0, separado: 0, falta: 0, pct: 0 };
  const barCor = pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Configuração da reserva ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: -0.3, marginBottom: 4 }}>Configuração da reserva</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Meta mensal de reserva/investimento</div>

        {/* Modo */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Modo de cálculo</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {MODOS_RESERVA.map(m => {
              const ativo = (reserva?.modo ?? "fixo") === m.key;
              return (
                <button key={m.key} onClick={() => onAtualizarReserva({ ...reserva, modo: m.key })} style={{ padding: "10px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: `2px solid ${ativo ? "#111" : "#f0f0f0"}`, background: ativo ? "#111" : "#fafafa", color: ativo ? "#fff" : "#888", textAlign: "left", transition: "all 0.15s" }}>
                  <div>{m.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Percentual e valor fixo */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Percentual</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fafafa", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #f0f0f0" }}>
              <input
                type="number" min="0" max="100"
                value={reserva?.percentual ?? 20}
                onChange={e => onAtualizarReserva({ ...reserva, percentual: Number(e.target.value) })}
                style={{ width: "100%", border: "none", background: "transparent", fontSize: 15, fontWeight: 700, outline: "none" }}
              />
              <span style={{ fontSize: 14, color: "#aaa", fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>= {fmtValor(totalRecebido * ((reserva?.percentual ?? 20) / 100), ocultarValores)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Valor fixo (R$)</div>
            <input
              type="number" min="0"
              value={reserva?.valorFixo ?? 4000}
              onChange={e => onAtualizarReserva({ ...reserva, valorFixo: Number(e.target.value) })}
              style={{ width: "100%", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "12px 14px", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box", background: "#fafafa" }}
            />
          </div>
        </div>

        {/* Valor já separado */}
        <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Valor já separado este mês</div>
          {editandoReserva ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input autoFocus type="text" inputMode="numeric"
                value={sepInput}
                onChange={e => setSepInput(e.target.value)}
                onBlur={salvarSeparado}
                onKeyDown={e => e.key === "Enter" && salvarSeparado()}
                placeholder="Ex: 1500"
                style={{ flex: 1, border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", fontSize: 15, fontWeight: 700, outline: "none", background: "#fff" }}
              />
              <button onClick={salvarSeparado} style={{ background: "#22c55e", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 13 }}>OK</button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#15803d", letterSpacing: -0.5 }}>{fmtValor(separado, ocultarValores)}</div>
              <button onClick={() => { setEditandoReserva(true); setSepInput(String(separado)); }} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#15803d" }}>Editar</button>
            </div>
          )}

          {/* Progresso reserva */}
          <div style={{ marginTop: 12 }}>
            <div style={{ background: "#e5e7eb", borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ background: barCor, borderRadius: 100, height: 6, width: `${Math.min(100, pct)}%`, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#15803d", marginTop: 5, fontWeight: 600 }}>
              <span>{Math.round(pct)}% da meta</span>
              <span>meta: {fmtValor(meta, ocultarValores)}</span>
            </div>
            {falta > 0 && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 3, fontWeight: 600 }}>Falta: {fmtValor(falta, ocultarValores)}</div>}
          </div>
        </div>
      </div>

      {/* ── Divisão por % ────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: -0.3, marginBottom: 4 }}>Como dividir</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Base: {fmtValor(totalRecebido, ocultarValores)} recebido</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DIVISAO.map(d => (
            <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#fafafa", borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{d.label}</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{d.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{fmtValor(totalRecebido * d.pct, ocultarValores)}</div>
                <div style={{ fontSize: 10, color: "#ccc" }}>{Math.round(d.pct * 100)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Orçamento por categoria ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: -0.3, marginBottom: 4 }}>Orçamento</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Toque na meta para editar</div>

        {catsAtivas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#ccc", fontSize: 13 }}>Adicione despesas para ver o orçamento</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {catsAtivas.map(cat => {
              const gasto  = gastoPorCat[cat.id] ?? 0;
              const meta   = getMeta(cat.id);
              const pct    = meta > 0 ? Math.min(100, (gasto / meta) * 100) : 0;
              const barCor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
              const ed     = editandoMeta === cat.id;
              return (
                <div key={cat.id} style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: meta > 0 ? 10 : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{cat.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 800, color: "#111" }}>{fmtValor(gasto, ocultarValores)}</span>
                      <span style={{ color: "#ccc" }}>/</span>
                      {ed ? (
                        <input autoFocus value={metaInput} onChange={e => setMetaInput(e.target.value)}
                          onBlur={() => salvarMeta(cat.id)}
                          onKeyDown={e => e.key === "Enter" && salvarMeta(cat.id)}
                          style={{ width: 80, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "4px 8px", fontSize: 13, fontWeight: 700, outline: "none" }} />
                      ) : (
                        <span onClick={() => { setEditandoMeta(cat.id); setMetaInput(meta > 0 ? String(meta) : ""); }}
                          style={{ fontWeight: 700, color: meta > 0 ? "#aaa" : "#d1d5db", cursor: "pointer", textDecoration: meta > 0 ? "none" : "underline dotted" }}>
                          {meta > 0 ? fmtValor(meta, ocultarValores) : "meta"}
                        </span>
                      )}
                    </div>
                  </div>
                  {meta > 0 && (
                    <>
                      <div style={{ background: "#f3f4f6", borderRadius: 100, height: 6, overflow: "hidden" }}>
                        <div style={{ background: barCor, borderRadius: 100, height: 6, width: `${pct}%`, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#bbb", marginTop: 5 }}>{Math.round(pct)}% · {fmtValor(Math.max(0, meta - gasto), ocultarValores)} restante</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "14px 16px", fontSize: 12, color: "#15803d", border: "1px solid #bbf7d0" }}>
        <strong>💡</strong> Separe os valores assim que receber. Não espere o fim do mês!
      </div>
    </div>
  );
}
