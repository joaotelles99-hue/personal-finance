import { useState } from "react";
import { parseBRL, fmt } from "../../utils";
import { CATEGORIAS } from "../../constants";

const TIPOS = [
  { key: "fixa",      label: "Recorrente", sub: "Todo mês" },
  { key: "parcelada", label: "Parcelada",  sub: "X vezes" },
  { key: "avulsa",    label: "Única",      sub: "Só este mês" },
];

const EMPTY = { nome: "", categoria: "outros", tipo: "fixa", valor: "", diaVencimento: "", conta: "", fixado: false, parcelaAtual: "1", totalParcelas: "" };

export default function DespesaModal({ editando, onSalvar, onFechar }) {
  const [form, setForm] = useState(editando ? {
    nome: editando.nome, categoria: editando.categoria, tipo: editando.tipo,
    valor: String(editando.valor), diaVencimento: String(editando.diaVencimento ?? ""),
    conta: editando.conta ?? "", fixado: editando.fixado ?? false,
    parcelaAtual: String(editando.parcelaAtual ?? 1), totalParcelas: String(editando.totalParcelas ?? ""),
  } : EMPTY);
  const [erro, setErro] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSalvar = () => {
    setErro("");
    if (!form.nome.trim()) return setErro("Informe o nome da despesa.");
    const valor = parseBRL(form.valor);
    if (!valor || valor <= 0) return setErro("Informe um valor válido.");
    const despesa = {
      ...editando, nome: form.nome.trim(), categoria: form.categoria, tipo: form.tipo,
      valor, diaVencimento: form.diaVencimento ? Number(form.diaVencimento) : null,
      conta: form.conta.trim() || null, fixado: form.fixado, pago: editando?.pago ?? false,
    };
    if (form.tipo === "parcelada") {
      const pa = Number(form.parcelaAtual) || 1;
      const tp = Number(form.totalParcelas);
      if (!tp || tp < 1) return setErro("Informe o total de parcelas.");
      if (pa > tp) return setErro("Parcela atual > total.");
      despesa.parcelaAtual = pa; despesa.totalParcelas = tp;
    } else { delete despesa.parcelaAtual; delete despesa.totalParcelas; }
    onSalvar(despesa);
  };

  const valorNum = parseBRL(form.valor);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 900, padding: "0 0 env(safe-area-inset-bottom,0px)" }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 24px 32px", width: "100%", maxWidth: 480, boxShadow: "0 -12px 40px rgba(0,0,0,0.15)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 24px" }} />
        <h3 style={{ margin: "0 0 24px", color: "#111", fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
          {editando ? "Editar Despesa" : "Nova Despesa"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tipo */}
          <div>
            <label style={lblStyle}>Tipo</label>
            <div style={{ display: "flex", gap: 8 }}>
              {TIPOS.map(t => {
                const ativo = form.tipo === t.key;
                return (
                  <button key={t.key} onClick={() => set("tipo", t.key)} style={{ flex: 1, padding: "11px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: `2px solid ${ativo ? "#111" : "#f0f0f0"}`, background: ativo ? "#111" : "#fafafa", color: ativo ? "#fff" : "#888", transition: "all 0.15s" }}>
                    <div>{t.label}</div>
                    <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{t.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Nome">
            <input type="text" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Aluguel, Netflix..." style={inputStyle} />
          </Field>

          <Field label="Categoria">
            <select value={form.categoria} onChange={e => set("categoria", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Valor (R$)">
              <input type="text" inputMode="numeric" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="150" style={inputStyle} />
              {valorNum > 0 && <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4, fontWeight: 600 }}>{fmt(valorNum)}</div>}
            </Field>
            <Field label="Dia vencimento">
              <input type="number" value={form.diaVencimento} onChange={e => set("diaVencimento", e.target.value)} placeholder="10" min="1" max="31" style={inputStyle} />
            </Field>
          </div>

          {form.tipo === "parcelada" && (
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Parcela atual">
                <input type="number" value={form.parcelaAtual} onChange={e => set("parcelaAtual", e.target.value)} min="1" style={inputStyle} />
              </Field>
              <Field label="Total parcelas">
                <input type="number" value={form.totalParcelas} onChange={e => set("totalParcelas", e.target.value)} placeholder="12" min="1" style={inputStyle} />
              </Field>
            </div>
          )}

          {form.tipo === "parcelada" && form.totalParcelas && form.parcelaAtual && (
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
              Faltam {Number(form.totalParcelas) - Number(form.parcelaAtual) + 1} de {form.totalParcelas} parcelas
            </div>
          )}

          <Field label="Conta / Cartão (opcional)">
            <input type="text" value={form.conta} onChange={e => set("conta", e.target.value)} placeholder="Nubank, dinheiro..." style={inputStyle} />
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: form.fixado ? "#fffbeb" : "#fafafa", border: `1.5px solid ${form.fixado ? "#fde68a" : "#f0f0f0"}`, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: form.fixado ? "#f59e0b" : "#fff", border: `2px solid ${form.fixado ? "#f59e0b" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {form.fixado && <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</span>}
            </div>
            <input type="checkbox" checked={form.fixado} onChange={e => set("fixado", e.target.checked)} style={{ display: "none" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>📌 Fixar no topo</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>Aparece destacada na lista</div>
            </div>
          </label>

          {erro && <div style={{ background: "#fff5f5", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{erro}</div>}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onFechar} style={{ flex: 1, padding: 15, border: "1.5px solid #f0f0f0", borderRadius: 14, background: "#fff", fontWeight: 600, fontSize: 14, color: "#555" }}>Cancelar</button>
          <button onClick={handleSalvar} style={{ flex: 1, padding: 15, border: "none", borderRadius: 14, background: "#111", color: "#fff", fontWeight: 700, fontSize: 14 }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={lblStyle}>{label}</label>
      {children}
    </div>
  );
}

const lblStyle = { fontSize: 12, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 };
const inputStyle = { width: "100%", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "13px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", background: "#fafafa", fontWeight: 500 };
