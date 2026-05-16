import { useState, useMemo } from "react";
import { fmtValor, totalmentePago, getAlunoStatus, fmt, valorRecebido, valorPendente } from "../../utils";

const hoje = new Date().getDate();

export default function DashboardTab({
  totalPrevisto, totalRecebido, totalPendente, despPagas, despPrevistas, saldo,
  alunos, despesas, ocultarValores, projecao,
  reservaInfo, limiteGastos, inadimplencia, pendencias, onPagarPendencia,
}) {
  const pct = totalPrevisto > 0 ? Math.min(100, (totalRecebido / totalPrevisto) * 100) : 0;
  const pagosCount     = useMemo(() => alunos.filter(a => totalmentePago(a)).length, [alunos]);
  const atrasadosCount = useMemo(() => alunos.filter(a => getAlunoStatus(a, hoje) === "atrasado").length, [alunos]);
  const despPagasCount = despesas.filter(d => d.pago).length;
  const saldoPositivo  = saldo >= 0;
  const diferenca      = projecao ? projecao.receitaProjetada - totalPrevisto : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Alerta atrasados */}
      {atrasadosCount > 0 && (
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>{atrasadosCount} pagamento{atrasadosCount > 1 ? "s" : ""} atrasado{atrasadosCount > 1 ? "s" : ""}</div>
            <div style={{ fontSize: 12, color: "#f87171", marginTop: 1 }}>Verifique a aba Alunos</div>
          </div>
        </div>
      )}

      {/* Saldo em destaque */}
      <div style={{ background: saldoPositivo ? "#f0fdf4" : "#fff5f5", borderRadius: 20, padding: "22px 22px", border: `1.5px solid ${saldoPositivo ? "#bbf7d0" : "#fecaca"}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: saldoPositivo ? "#16a34a" : "#dc2626", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Saldo estimado</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: saldoPositivo ? "#15803d" : "#dc2626", letterSpacing: -1, lineHeight: 1 }}>
          {ocultarValores ? "R$ ••••" : (saldoPositivo ? "+" : "") + fmtValor(saldo, false)}
        </div>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Recebido − despesas pagas</div>
      </div>

      {/* Grid KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPI label="Recebido"        val={fmtValor(totalRecebido,  ocultarValores)} sub={`${pagosCount} de ${alunos.length} alunos`}   cor="#15803d" />
        <KPI label="A Receber"       val={fmtValor(totalPendente,  ocultarValores)} sub={`${alunos.length - pagosCount} pendentes`}      cor="#d97706" />
        <KPI label="Desp. Pagas"     val={fmtValor(despPagas,      ocultarValores)} sub={`${despPagasCount} de ${despesas.length}`}      cor="#dc2626" />
        <KPI label="Desp. Previstas" val={fmtValor(despPrevistas,  ocultarValores)} sub="total do mês"                                  cor="#2563eb" />
      </div>

      {/* Progresso */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "18px 18px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Progresso do mês</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#27ae60" }}>{Math.round(pct)}%</div>
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 100, height: 8, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg, #27ae60, #4ade80)", borderRadius: 100, height: 8, width: `${pct}%`, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginTop: 8 }}>
          <span>{fmtValor(totalRecebido, ocultarValores)} recebido</span>
          <span>meta {fmtValor(totalPrevisto, ocultarValores)}</span>
        </div>
      </div>

      {/* ── Reserva e Limite ──────────────────────────────────────────────────── */}
      {reservaInfo && (
        <>
          <Divisor label="Reserva e Limite" />

          {/* Meta de reserva */}
          <CardReserva reservaInfo={reservaInfo} ocultarValores={ocultarValores} />

          {/* Limite seguro de gastos */}
          {limiteGastos && <CardLimite limiteGastos={limiteGastos} ocultarValores={ocultarValores} />}
        </>
      )}

      {/* ── Inadimplência ─────────────────────────────────────────────────────── */}
      {inadimplencia?.temInadimplencia && (
        <>
          <Divisor label="Inadimplência" />
          <CardInadimplencia inadimplencia={inadimplencia} ocultarValores={ocultarValores} />
          <ListaPendentes
            alunos={alunos} pendencias={pendencias}
            inadimplencia={inadimplencia}
            ocultarValores={ocultarValores}
            onPagarPendencia={onPagarPendencia}
          />
        </>
      )}

      {/* ── Próximo Mês ───────────────────────────────────────────────────────── */}
      {projecao && (
        <>
          <Divisor label="Próximo Mês" />

          <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 16 }}>Projeção do próximo mês</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <LinhaProjecao label="Receita projetada"    val={fmtValor(projecao.receitaProjetada, ocultarValores)} cor="#15803d" />
              <LinhaProjecao label="Despesas recorrentes" val={fmtValor(projecao.despRecorrentes,  ocultarValores)} cor="#dc2626" />
              <div style={{ height: 1, background: "#f0f0f0" }} />
              <LinhaProjecao label="Saldo estimado"       val={fmtValor(projecao.saldoEstimado,    ocultarValores)} cor={projecao.saldoEstimado >= 0 ? "#15803d" : "#dc2626"} bold />
              <LinhaProjecao
                label="Diferença vs mês atual"
                val={ocultarValores ? "R$ ••••" : `${diferenca >= 0 ? "+" : ""}${fmt(diferenca)}`}
                cor={diferenca >= 0 ? "#15803d" : "#dc2626"}
              />
            </div>
          </div>

          {projecao.temRisco && (
            <div style={{ background: "#fff5f5", borderRadius: 20, padding: "20px 20px", border: "1.5px solid #fecaca" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#dc2626", marginBottom: 4 }}>⚠️ Risco de saída</div>
              <div style={{ fontSize: 12, color: "#f87171", marginBottom: 16 }}>Impacto previsto no próximo mês</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {projecao.perdaConfirmada > 0 && <LinhaProjecao label="Perda confirmada"    val={fmtValor(projecao.perdaConfirmada, ocultarValores)} cor="#dc2626" bold />}
                {projecao.receitaEmRisco  > 0 && <LinhaProjecao label="Receita em risco"    val={fmtValor(projecao.receitaEmRisco,  ocultarValores)} cor="#f59e0b" />}
                {projecao.perdaConfirmada > 0 && projecao.receitaEmRisco > 0 && (
                  <>
                    <div style={{ height: 1, background: "#fecaca" }} />
                    <LinhaProjecao label="Total potencial" val={fmtValor(projecao.perdaConfirmada + projecao.receitaEmRisco, ocultarValores)} cor="#dc2626" bold />
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 4 }}>Cenários financeiros</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Projeção com base no status dos alunos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Cenario label="Atual"      sub="Todos os alunos ativos" receita={projecao.totalPrevisto}    despesas={projecao.despRecorrentes} saldo={projecao.totalPrevisto - projecao.despRecorrentes} cor="#2563eb" ocultarValores={ocultarValores} />
              <Cenario label="Realista"   sub="Remove quem vai sair"   receita={projecao.receitaRealista}  despesas={projecao.despRecorrentes} saldo={projecao.saldoRealista}   diferenca={projecao.receitaRealista  - projecao.totalPrevisto} cor="#d97706" ocultarValores={ocultarValores} />
              <Cenario label="Pessimista" sub="Remove em risco também" receita={projecao.receitaPessimista} despesas={projecao.despRecorrentes} saldo={projecao.saldoPessimista} diferenca={projecao.receitaPessimista - projecao.totalPrevisto} cor="#dc2626" ocultarValores={ocultarValores} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function CardReserva({ reservaInfo, ocultarValores }) {
  const { meta, separado, falta, pct } = reservaInfo;
  const cor = pct >= 100 ? "#15803d" : pct >= 60 ? "#d97706" : "#dc2626";
  const barCor = pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const msg = pct >= 100 ? "Meta atingida!" : pct >= 60 ? "Atenção: separe mais." : "Risco de não bater a meta.";

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", border: `1.5px solid ${barCor}44` }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 4 }}>Meta de reserva do mês</div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>{msg}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <LinhaProjecao label="Meta configurada"  val={fmtValor(meta,     ocultarValores)} cor="#2563eb" />
        <LinhaProjecao label="Já separado"        val={fmtValor(separado, ocultarValores)} cor="#15803d" />
        <LinhaProjecao label="Falta separar"      val={fmtValor(falta,    ocultarValores)} cor={cor} bold />
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 100, height: 8, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ background: barCor, borderRadius: 100, height: 8, width: `${Math.min(100, pct)}%`, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: cor, fontWeight: 700 }}>{Math.round(pct)}% da meta</div>
    </div>
  );
}

function CardLimite({ limiteGastos, ocultarValores }) {
  const { limite, usado, disponivel, pct } = limiteGastos;
  const cor = pct > 100 ? "#dc2626" : pct > 90 ? "#dc2626" : pct > 70 ? "#f59e0b" : "#15803d";
  const barCor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
  const msg = pct > 100
    ? `Ultrapassou o limite em ${fmtValor(Math.abs(disponivel), false)}`
    : pct > 90 ? "Cuidado: sua meta de reserva pode ser comprometida."
    : pct > 70 ? `Atenção: você já usou ${Math.round(pct)}% do seu limite.`
    : "Você está dentro do limite seguro.";

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", border: `1.5px solid ${barCor}44` }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 4 }}>Limite seguro de gastos</div>
      <div style={{ fontSize: 12, color: cor, marginBottom: 14, fontWeight: 600 }}>{msg}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <LinhaProjecao label="Limite seguro"      val={fmtValor(limite,     ocultarValores)} cor="#2563eb" />
        <LinhaProjecao label="Gastos variáveis"   val={fmtValor(usado,      ocultarValores)} cor="#dc2626" />
        <LinhaProjecao label="Ainda disponível"   val={fmtValor(Math.max(0, disponivel), ocultarValores)} cor={cor} bold />
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 100, height: 8, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ background: barCor, borderRadius: 100, height: 8, width: `${Math.min(100, pct)}%`, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: cor, fontWeight: 700 }}>{Math.round(Math.min(pct, 110))}% do limite usado</div>
    </div>
  );
}

function CardInadimplencia({ inadimplencia, ocultarValores }) {
  const { totalEmAtraso, totalPendenteAtual, totalAnterior, parciais, semPagar } = inadimplencia;
  return (
    <div style={{ background: "#fff5f5", borderRadius: 20, padding: "20px 20px", border: "1.5px solid #fecaca" }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: "#dc2626", marginBottom: 14 }}>Inadimplência</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        <LinhaProjecao label="Total em atraso"           val={fmtValor(totalEmAtraso,      ocultarValores)} cor="#dc2626" bold />
        <LinhaProjecao label="Pendente mês atual"        val={fmtValor(totalPendenteAtual, ocultarValores)} cor="#f97316" />
        {totalAnterior > 0 && (
          <LinhaProjecao label="Pendente meses anteriores" val={fmtValor(totalAnterior, ocultarValores)} cor="#dc2626" />
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {semPagar > 0 && (
          <span style={{ fontSize: 11, background: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 10px", fontWeight: 700 }}>
            {semPagar} sem pagar
          </span>
        )}
        {parciais > 0 && (
          <span style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", borderRadius: 20, padding: "4px 10px", fontWeight: 700 }}>
            {parciais} parcial
          </span>
        )}
      </div>
    </div>
  );
}

function ListaPendentes({ alunos, pendencias, inadimplencia, ocultarValores, onPagarPendencia }) {
  const [aberto, setAberto] = useState(false);
  const { pendentesAnteriores } = inadimplencia;

  const alunosSemPagar = alunos.filter(a => valorPendente(a) > 0);

  const totalItens = alunosSemPagar.length + pendentesAnteriores.length;
  if (totalItens === 0) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", overflow: "hidden" }}>
      <button onClick={() => setAberto(v => !v)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>Alunos em atraso</span>
        <span style={{ fontSize: 12, color: "#aaa" }}>{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {alunosSemPagar.map(a => {
            const rec     = valorRecebido(a);
            const pend    = valorPendente(a);
            const pendsAnt = pendentesAnteriores.filter(p => p.alunoId === a.id);
            const totalAnt = pendsAnt.reduce((s, p) => s + p.valorPendente, 0);
            return (
              <div key={a.id} style={{ background: "#fafafa", borderRadius: 14, padding: "14px 14px", border: "1px solid #f0f0f0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 8 }}>{a.nome}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: totalAnt > 0 ? 10 : 0 }}>
                  <LinhaProjecao label="Valor mensal"    val={fmtValor(a.valor, ocultarValores)} cor="#555" />
                  {rec > 0 && <LinhaProjecao label="Pago"       val={fmtValor(rec,     ocultarValores)} cor="#15803d" />}
                  <LinhaProjecao label="Pendente (mês atual)" val={fmtValor(pend, ocultarValores)} cor="#f97316" bold />
                  {totalAnt > 0 && <LinhaProjecao label="Pendente (anterior)" val={fmtValor(totalAnt, ocultarValores)} cor="#dc2626" bold />}
                </div>
                {pendsAnt.map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff5f5", borderRadius: 10, padding: "8px 12px", marginTop: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{p.mes}</div>
                      {p.observacao && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{p.observacao}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>{fmtValor(p.valorPendente, ocultarValores)}</span>
                      <button onClick={() => onPagarPendencia(p.id)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>Pago</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Pendências de alunos sem débito corrente mas com anterior */}
          {pendentesAnteriores
            .filter(p => !alunosSemPagar.find(a => a.id === p.alunoId))
            .map(p => (
              <div key={p.id} style={{ background: "#fff5f5", borderRadius: 14, padding: "12px 14px", border: "1px solid #fecaca" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{p.alunoNome}</div>
                    <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>{p.mes}</div>
                    {p.observacao && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{p.observacao}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{fmtValor(p.valorPendente, ocultarValores)}</span>
                    <button onClick={() => onPagarPendencia(p.id)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>Pago</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function KPI({ label, val, sub, cor }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "16px 16px", border: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: cor, letterSpacing: -0.3 }}>{val}</div>
      <div style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function LinhaProjecao({ label, val, cor, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#555", fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 800 : 700, color: cor }}>{val}</span>
    </div>
  );
}

function Cenario({ label, sub, receita, despesas, saldo, diferenca, cor, ocultarValores }) {
  const saldoPositivo = saldo >= 0;
  return (
    <div style={{ background: "#fafafa", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${cor}22` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: cor }}>{label}</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{sub}</div>
        </div>
        {diferenca !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 700, color: diferenca >= 0 ? "#15803d" : "#dc2626", background: diferenca >= 0 ? "#f0fdf4" : "#fff5f5", padding: "3px 8px", borderRadius: 20 }}>
            {diferenca >= 0 ? "+" : ""}{fmtValor(Math.abs(diferenca), ocultarValores)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <LinhaProjecao label="Receita prevista"  val={fmtValor(receita,  ocultarValores)} cor="#15803d" />
        <LinhaProjecao label="Desp. recorrentes" val={fmtValor(despesas, ocultarValores)} cor="#dc2626" />
        <div style={{ height: 1, background: "#e5e7eb", margin: "2px 0" }} />
        <LinhaProjecao label="Saldo estimado"    val={fmtValor(saldo,    ocultarValores)} cor={saldoPositivo ? "#15803d" : "#dc2626"} bold />
      </div>
    </div>
  );
}

function Divisor({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
}
