import { useState } from "react";
import { fmtValor } from "../../utils";
import { MESES, CATEGORIAS } from "../../constants";

export default function GraficoTab({ historico, totalRecebido, totalPrevisto, ocultarValores }) {
  const mesAtual = (() => { const d = new Date(); return `${MESES[d.getMonth()]} ${d.getFullYear()}`; })();
  const dados = [...historico, { mes: mesAtual, total: totalRecebido }];
  const maxVal = Math.max(...dados.map(d => d.total), totalPrevisto, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: -0.3, marginBottom: 4 }}>Histórico</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>Recebimentos dos últimos meses</div>

        {dados.every(d => d.total === 0) ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#ccc" }}>
            <div style={{ fontSize: 36 }}>📭</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Marque pagamentos para ver o gráfico</div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
            {dados.map((d, i) => {
              const isAtual = i === dados.length - 1;
              const altura = Math.max(8, (d.total / maxVal) * 150);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 8, color: isAtual ? "#15803d" : "#aaa", fontWeight: 700, textAlign: "center" }}>
                    {ocultarValores ? "••" : fmtValor(d.total, false).replace("R$\u00a0", "").replace("R$ ", "")}
                  </div>
                  <div style={{
                    width: "100%", height: altura,
                    background: isAtual ? "#111" : "#f3f4f6",
                    borderRadius: "8px 8px 0 0",
                    transition: "height 0.5s ease",
                    border: isAtual ? "none" : "none",
                  }} />
                  <div style={{ fontSize: 8, color: "#bbb", textAlign: "center", lineHeight: 1.3 }}>
                    {d.mes.split(" ")[0].slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {historico.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f0f0f0" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 14 }}>Registros anteriores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...historico].reverse().map((d, i) => (
              <MesCard key={i} d={d} ocultarValores={ocultarValores} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MesCard({ d, ocultarValores }) {
  const [aberto, setAberto] = useState(false);
  const [abaHistorico, setAbaHistorico] = useState("despesas");
  const despesas = d.despesas ?? [];
  const alunos   = d.alunos   ?? [];
  const totalDesp  = despesas.reduce((s, x) => s + x.valor, 0);
  const totalPagas = despesas.filter(x => x.pago).reduce((s, x) => s + x.valor, 0);
  const totalAlunos = alunos.reduce((s, a) => s + a.valor, 0);

  return (
    <div style={{ background: "#fafafa", borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => setAberto(v => !v)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{d.mes}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>{fmtValor(d.total, ocultarValores)}</span>
          <span style={{ fontSize: 11, color: "#aaa" }}>{aberto ? "▲" : "▼"}</span>
        </div>
      </button>

      {aberto && (
        <div style={{ padding: "0 14px 14px" }}>
          {/* Resumo rápido */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 3 }}>RECEBIDO</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>{fmtValor(d.total, ocultarValores)}</div>
            </div>
            <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 3 }}>DESP. PAGAS</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{fmtValor(totalPagas, ocultarValores)}</div>
            </div>
            <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 3 }}>SALDO</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: (d.total - totalPagas) >= 0 ? "#15803d" : "#dc2626" }}>{fmtValor(d.total - totalPagas, ocultarValores)}</div>
            </div>
          </div>

          {/* Abas internas: alunos / despesas */}
          {alunos.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {["despesas", "alunos"].map(aba => (
                <button key={aba} onClick={() => setAbaHistorico(aba)} style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "none",
                  background: abaHistorico === aba ? "#111" : "#f3f4f6",
                  color: abaHistorico === aba ? "#fff" : "#666",
                }}>
                  {aba === "despesas" ? `Despesas (${despesas.length})` : `Alunos (${alunos.length})`}
                </button>
              ))}
            </div>
          )}

          {/* Lista despesas */}
          {abaHistorico === "despesas" && (
            despesas.length === 0 ? (
              <div style={{ fontSize: 12, color: "#ccc", textAlign: "center", padding: "12px 0" }}>Sem despesas registradas</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {despesas.map((desp, i) => {
                  const catCfg = CATEGORIAS.find(c => c.id === desp.categoria) ?? CATEGORIAS[CATEGORIAS.length - 1];
                  return (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${desp.pago ? "#bbf7d0" : "#f0f0f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{desp.nome}</div>
                        <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                          <span style={{ fontSize: 9, background: catCfg.cor, color: catCfg.corTexto, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{catCfg.label}</span>
                          {desp.tipo === "parcelada" && (
                            <span style={{ fontSize: 9, background: "#eff6ff", color: "#2563eb", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{desp.parcelaAtual}/{desp.totalParcelas}x</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: desp.pago ? "#15803d" : "#111" }}>{fmtValor(desp.valor, ocultarValores)}</div>
                        <div style={{ fontSize: 10, color: desp.pago ? "#22c55e" : "#ccc", fontWeight: 600 }}>{desp.pago ? "✓ pago" : "pendente"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Lista alunos */}
          {abaHistorico === "alunos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {alunos.map((al, i) => {
                const receb = al.dupla
                  ? ((al.pago1 ? al.valor / 2 : 0) + (al.pago2 ? al.valor / 2 : 0))
                  : (al.pago ? al.valor : 0);
                const pago = al.dupla ? (al.pago1 && al.pago2) : al.pago;
                return (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${pago ? "#bbf7d0" : "#f0f0f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{al.nome}</div>
                      {al.dupla && <span style={{ fontSize: 9, background: "#eff6ff", color: "#2563eb", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>dupla</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: pago ? "#15803d" : "#111" }}>{fmtValor(receb > 0 ? receb : al.valor, ocultarValores)}</div>
                      <div style={{ fontSize: 10, color: pago ? "#22c55e" : "#ccc", fontWeight: 600 }}>{pago ? "✓ pago" : receb > 0 ? "parcial" : "pendente"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
