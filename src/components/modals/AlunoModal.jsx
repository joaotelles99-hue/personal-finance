import { useState } from "react";
import { fmt } from "../../utils";

const STATUS_SAIDA = [
  { value: "ativo",           label: "Ativo",                    cor: "#22c55e" },
  { value: "em-risco",        label: "Em risco de sair",         cor: "#f59e0b" },
  { value: "sai-este-mes",    label: "Vai sair este mês",        cor: "#f97316" },
  { value: "sai-proximo-mes", label: "Vai sair no próximo mês",  cor: "#ef4444" },
  { value: "inativo",         label: "Inativo",                  cor: "#9ca3af" },
];

const EMPTY = { nome: "", valor: "", vencimento: "", dupla: false, statusSaida: "ativo", observacao: "" };

export default function AlunoModal({ editando, onSalvar, onFechar }) {
  const [form, setForm] = useState(
    editando ? {
      nome: editando.nome,
      valor: String(editando.valor),
      vencimento: String(editando.vencimento),
      dupla: editando.dupla,
      statusSaida: editando.statusSaida ?? "ativo",
      observacao: editando.observacao ?? "",
    } : EMPTY
  );

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSalvar = () => {
    if (!form.nome.trim() || !form.valor || !form.vencimento) return;
    const base = {
      ...editando,
      nome: form.nome.trim(),
      valor: Number(form.valor),
      vencimento: Number(form.vencimento),
      dupla: form.dupla,
      statusSaida: form.statusSaida,
      observacao: form.observacao.trim() || null,
    };
    if (form.dupla) { base.pago = base.pago ?? false; base.pago1 = base.pago1 ?? false; base.pago2 = base.pago2 ?? false; }
    else { base.pago = base.pago ?? false; delete base.pago1; delete base.pago2; }
    onSalvar(base);
  };

  const valorNum = Number(form.valor);
  const statusAtual = STATUS_SAIDA.find(s => s.value === form.statusSaida) ?? STATUS_SAIDA[0];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 900, padding: "0 0 env(safe-area-inset-bottom,0px)" }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 24px 32px", width: "100%", maxWidth: 480, boxShadow: "0 -12px 40px rgba(0,0,0,0.15)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 24px" }} />
        <h3 style={{ margin: "0 0 24px", color: "#111", fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
          {editando ? "Editar Aluno" : "Novo Aluno"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label={form.dupla ? "Nomes da dupla" : "Nome do aluno"}>
            <input type="text" value={form.nome} onChange={e => set("nome", e.target.value)}
              placeholder={form.dupla ? "Ex: Ana e Pedro" : "Ex: Carlos"}
              style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Valor mensal (R$)">
              <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)}
                placeholder="450" style={inputStyle} />
            </Field>
            <Field label="Dia do vencimento">
              <input type="number" value={form.vencimento} onChange={e => set("vencimento", e.target.value)}
                placeholder="5" min="1" max="31" style={inputStyle} />
            </Field>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: form.dupla ? "#f0fdf4" : "#fafafa", border: `1.5px solid ${form.dupla ? "#bbf7d0" : "#f0f0f0"}`, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: form.dupla ? "#22c55e" : "#fff", border: `2px solid ${form.dupla ? "#22c55e" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {form.dupla && <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</span>}
            </div>
            <input type="checkbox" checked={form.dupla} onChange={e => set("dupla", e.target.checked)} style={{ display: "none" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Treino em dupla</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>Cada pessoa paga metade</div>
            </div>
          </label>

          {form.dupla && valorNum > 0 && (
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#15803d", fontWeight: 600 }}>
              Cada pessoa paga: {fmt(valorNum / 2)}
            </div>
          )}

          {/* Status de saída */}
          <Field label="Status do aluno">
            <select value={form.statusSaida} onChange={e => set("statusSaida", e.target.value)}
              style={{ ...inputStyle, appearance: "none", color: statusAtual.cor, fontWeight: 700 }}>
              {STATUS_SAIDA.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          {form.statusSaida !== "ativo" && (
            <div style={{ background: form.statusSaida === "em-risco" ? "#fffbeb" : "#fff5f5", border: `1.5px solid ${statusAtual.cor}33`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: statusAtual.cor, marginBottom: 8 }}>
                Observação (opcional)
              </div>
              <input type="text" value={form.observacao} onChange={e => set("observacao", e.target.value)}
                placeholder="Ex: cortou gastos, contrato encerrado..."
                style={{ ...inputStyle, background: "#fff", marginBottom: 0 }} />
            </div>
          )}
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
      <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "13px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", background: "#fafafa", fontWeight: 500 };
