import { useState, useMemo } from "react";
import { fmtValor, fmt, parseBRL } from "../../utils";
import { DIVISAO, CATEGORIAS } from "../../constants";

export default function DivisaoTab({ totalRecebido, despesas, orcamento, ocultarValores, onAtualizarOrcamento }) {
  const [editandoMeta, setEditandoMeta] = useState(null);
  const [metaInput,    setMetaInput]    = useState("");

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

  const catsAtivas = useMemo(() => {
    const ids = new Set([...despesas.map(d => d.categoria), ...orcamento.map(o => o.categoria)]);
    return CATEGORIAS.filter(c => ids.has(c.id));
  }, [despesas, orcamento]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Divisão por % */}
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

      {/* Orçamento por categoria */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: -0.3, marginBottom: 4 }}>Orçamento</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Toque na meta para editar</div>

        {catsAtivas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#ccc", fontSize: 13 }}>
            Adicione despesas para ver o orçamento
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {catsAtivas.map(cat => {
              const gasto = gastoPorCat[cat.id] ?? 0;
              const meta  = getMeta(cat.id);
              const pct   = meta > 0 ? Math.min(100, (gasto / meta) * 100) : 0;
              const barCor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
              const editando = editandoMeta === cat.id;

              return (
                <div key={cat.id} style={{ padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: meta > 0 ? 10 : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{cat.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 800, color: "#111" }}>{fmtValor(gasto, ocultarValores)}</span>
                      <span style={{ color: "#ccc" }}>/</span>
                      {editando ? (
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
                      <div style={{ fontSize: 10, color: "#bbb", marginTop: 5 }}>
                        {Math.round(pct)}% · {fmtValor(Math.max(0, meta - gasto), ocultarValores)} restante
                      </div>
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
