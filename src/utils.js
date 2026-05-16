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
