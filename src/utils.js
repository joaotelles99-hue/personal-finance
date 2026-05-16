import { MESES } from "./constants";

// ── Formatação ────────────────────────────────────────────────────────────────
export const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtValor = (v, ocultar) => ocultar ? "R$ ••••" : fmt(v);
export const parseBRL = (str) => Number(String(str).replace(/\./g, "").replace(",", "."));

// ── Datas ─────────────────────────────────────────────────────────────────────
export const getMesAno = () => {
  const d = new Date();
  return `${d.getMonth()}-${d.getFullYear()}`;
};
export const getMesNome = () => {
  const d = new Date();
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

// ── Alunos ────────────────────────────────────────────────────────────────────
export function valorRecebido(a) {
  if (!a.dupla) return a.pago ? a.valor : 0;
  const m = a.valor / 2;
  return (a.pago1 ? m : 0) + (a.pago2 ? m : 0);
}
export function valorPendente(a) { return a.valor - valorRecebido(a); }
export function totalmentePago(a) {
  return a.dupla ? !!(a.pago1 && a.pago2) : !!a.pago;
}
export function nomesDiv(nome) {
  const p = nome.split(/ e /i);
  return p.length >= 2 ? [p[0].trim(), p.slice(1).join(" e ").trim()] : [nome, "Pessoa 2"];
}
export function getAlunoStatus(aluno, hoje) {
  if (totalmentePago(aluno)) return "em-dia";
  const dias = aluno.vencimento - hoje;
  if (dias < 0) return "atrasado";
  if (dias <= 3) return "vence-em-breve";
  return "em-dia";
}

// ── Despesas ──────────────────────────────────────────────────────────────────
export function resetarDespesasParaMes(despesas) {
  const result = [];
  for (const d of despesas) {
    if (d.tipo === "avulsa") continue;
    if (d.tipo === "fixa") { result.push({ ...d, pago: false }); continue; }
    if (d.tipo === "parcelada") {
      const nova = (d.parcelaAtual ?? 1) + 1;
      if (nova > (d.totalParcelas ?? 1)) continue;
      result.push({ ...d, pago: false, parcelaAtual: nova });
    }
  }
  return result;
}
export const totalDespesasPagas = (despesas) =>
  despesas.filter(d => d.pago).reduce((s, d) => s + d.valor, 0);
export const totalDespesasPrevistas = (despesas) =>
  despesas.reduce((s, d) => s + d.valor, 0);

// ── Reserva / Meta mensal ─────────────────────────────────────────────────────
export function calcularMeta(reserva, totalRecebido) {
  const pct   = reserva?.percentual ?? 20;
  const fixo  = reserva?.valorFixo  ?? 4000;
  const modo  = reserva?.modo       ?? "fixo";
  const porPct = totalRecebido * (pct / 100);
  switch (modo) {
    case "percentual": return porPct;
    case "fixo":       return fixo;
    case "maior":      return Math.max(porPct, fixo);
    case "menor":      return Math.min(porPct, fixo);
    default:           return fixo;
  }
}

export function calcularReservaInfo(reserva, totalRecebido) {
  const meta     = calcularMeta(reserva, totalRecebido);
  const separado = reserva?.separado ?? 0;
  const falta    = Math.max(0, meta - separado);
  const pct      = meta > 0 ? Math.min(100, (separado / meta) * 100) : 0;
  return { meta, separado, falta, pct };
}

// ── Limite seguro de gastos ───────────────────────────────────────────────────
const naturezaDespesa = (d) => d.natureza ?? (d.tipo === "avulsa" ? "variavel" : "fixa");

export function calcularLimiteGastos(reserva, totalPrevisto, despesas) {
  const meta      = calcularMeta(reserva, totalPrevisto);
  const despFixas = despesas.filter(d => naturezaDespesa(d) === "fixa").reduce((s, d) => s + d.valor, 0);
  const usado     = despesas.filter(d => naturezaDespesa(d) === "variavel").reduce((s, d) => s + d.valor, 0);
  const limite    = Math.max(0, totalPrevisto - meta - despFixas);
  const disponivel = Math.max(0, limite - usado);
  const pct       = limite > 0 ? Math.min(110, (usado / limite) * 100) : (usado > 0 ? 110 : 0);
  return { meta, despFixas, limite, usado, disponivel, pct };
}

// ── Inadimplência ─────────────────────────────────────────────────────────────
export function calcularInadimplencia(alunos, pendencias) {
  const totalPendenteAtual = alunos.reduce((s, a) => s + valorPendente(a), 0);
  const pendentesAnteriores = (pendencias ?? []).filter(p => !p.pago);
  const totalAnterior      = pendentesAnteriores.reduce((s, p) => s + p.valorPendente, 0);
  const parciais  = alunos.filter(a => valorRecebido(a) > 0 && !totalmentePago(a));
  const semPagar  = alunos.filter(a => valorRecebido(a) === 0 && a.valor > 0 && (a.statusSaida ?? "ativo") !== "inativo");
  return {
    totalPendenteAtual,
    totalAnterior,
    totalEmAtraso: totalPendenteAtual + totalAnterior,
    parciais: parciais.length,
    semPagar: semPagar.length,
    pendentesAnteriores,
    temInadimplencia: totalPendenteAtual > 0 || totalAnterior > 0,
  };
}

// ── Projeção do próximo mês ───────────────────────────────────────────────────
export function calcularProjecao(alunos, despesas) {
  const totalPrevisto = alunos.reduce((s, a) => s + a.valor, 0);

  const receitaProjetada = alunos
    .filter(a => !["sai-proximo-mes", "inativo"].includes(a.statusSaida ?? "ativo"))
    .reduce((s, a) => s + a.valor, 0);

  const receitaRealista = alunos
    .filter(a => !["sai-este-mes", "sai-proximo-mes", "inativo"].includes(a.statusSaida ?? "ativo"))
    .reduce((s, a) => s + a.valor, 0);

  const receitaPessimista = alunos
    .filter(a => !["em-risco", "sai-este-mes", "sai-proximo-mes", "inativo"].includes(a.statusSaida ?? "ativo"))
    .reduce((s, a) => s + a.valor, 0);

  const despRecorrentes = despesas
    .filter(d => {
      if (d.tipo === "fixa") return true;
      if (d.tipo === "parcelada") return ((d.parcelaAtual ?? 1) + 1) <= (d.totalParcelas ?? 1);
      return false;
    })
    .reduce((s, d) => s + d.valor, 0);

  const perdaConfirmada = alunos
    .filter(a => ["sai-proximo-mes", "sai-este-mes"].includes(a.statusSaida ?? "ativo"))
    .reduce((s, a) => s + a.valor, 0);

  const receitaEmRisco = alunos
    .filter(a => (a.statusSaida ?? "ativo") === "em-risco")
    .reduce((s, a) => s + a.valor, 0);

  return {
    totalPrevisto,
    receitaProjetada,
    receitaRealista,
    receitaPessimista,
    despRecorrentes,
    perdaConfirmada,
    receitaEmRisco,
    saldoEstimado:    receitaProjetada  - despRecorrentes,
    saldoRealista:    receitaRealista   - despRecorrentes,
    saldoPessimista:  receitaPessimista - despRecorrentes,
    temRisco: perdaConfirmada > 0 || receitaEmRisco > 0,
  };
}
