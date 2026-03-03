import { useState, useMemo, useEffect } from "react";

const initialAlunos = [
  { id: 1, nome: "Fatima e Andreia", dupla: true, valor: 950, vencimento: 26, pago: false },
  { id: 2, nome: "Eliane, Suzete", dupla: true, valor: 600, vencimento: 2, pago: false },
  { id: 3, nome: "Lucileide", dupla: false, valor: 450, vencimento: 2, pago: false },
  { id: 4, nome: "Gisele e Heloisa", dupla: true, valor: 900, vencimento: 2, pago: false },
  { id: 5, nome: "Henrique", dupla: false, valor: 800, vencimento: 30, pago: false },
  { id: 6, nome: "Elis e Nilva", dupla: true, valor: 600, vencimento: 6, pago: false },
  { id: 7, nome: "Emily e Tiago", dupla: true, valor: 900, vencimento: 24, pago: false },
  { id: 8, nome: "Lucas e Cristiane", dupla: true, valor: 560, vencimento: 28, pago: false },
  { id: 9, nome: "Joao Luis", dupla: false, valor: 700, vencimento: 28, pago: false },
  { id: 10, nome: "Izabela", dupla: false, valor: 620, vencimento: 9, pago: false },
  { id: 11, nome: "Bruno", dupla: false, valor: 650, vencimento: 19, pago: false },
  { id: 12, nome: "Iudmilla", dupla: false, valor: 900, vencimento: 2, pago: false },
  { id: 13, nome: "João", dupla: false, valor: 180, vencimento: 22, pago: false },
  { id: 14, nome: "Norma", dupla: false, valor: 200, vencimento: 16, pago: false },
  { id: 15, nome: "Edinamar", dupla: false, valor: 100, vencimento: 30, pago: false },
  { id: 16, nome: "Gustavo", dupla: false, valor: 150, vencimento: 6, pago: false },
  { id: 17, nome: "Kayllany", dupla: false, valor: 200, vencimento: 10, pago: false },
];

const DIVISAO = [
  { label: "🏠 Fixos Essenciais", pct: 0.40, cor: "#e8f5e9", corTexto: "#2e7d32", desc: "Aluguel, contas, alimentação" },
  { label: "💰 Investimentos", pct: 0.20, cor: "#e3f2fd", corTexto: "#1565c0", desc: "CDB, Tesouro, Fundos" },
  { label: "🛡️ Reserva de Emergência", pct: 0.10, cor: "#fff8e1", corTexto: "#f57f17", desc: "Meta: 6x seus gastos fixos" },
  { label: "🎉 Lazer & Estilo de Vida", pct: 0.15, cor: "#fce4ec", corTexto: "#880e4f", desc: "Passeios, roupas, hobbies" },
  { label: "📈 Crescimento Profissional", pct: 0.05, cor: "#f3e5f5", corTexto: "#6a1b9a", desc: "Cursos, certificações" },
  { label: "🎯 Metas & Sonhos", pct: 0.10, cor: "#e0f7fa", corTexto: "#006064", desc: "Viagem, carro, imóvel" },
];

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function getMesAno() {
  const d = new Date();
  return `${d.getMonth()}-${d.getFullYear()}`;
}

export default function App() {
  const [alunos, setAlunos] = useState(() => {
    try {
      const mesAtual = getMesAno();
      const mesRef = localStorage.getItem("pf-mes");
      const saved = localStorage.getItem("pf-alunos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (mesRef !== mesAtual) {
          const reset = parsed.map(a => ({ ...a, pago: false }));
          localStorage.setItem("pf-mes", mesAtual);
          localStorage.setItem("pf-alunos", JSON.stringify(reset));
          return reset;
        }
        return parsed;
      }
      localStorage.setItem("pf-mes", mesAtual);
      return initialAlunos;
    } catch { return initialAlunos; }
  });

  const [gastos, setGastos] = useState(() => {
    try { return Number(localStorage.getItem("pf-gastos")) || 1500; } catch { return 1500; }
  });

  const [aba, setAba] = useState("alunos");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [novoAluno, setNovoAluno] = useState({ nome: "", valor: "", vencimento: "", dupla: false });

  useEffect(() => {
    localStorage.setItem("pf-alunos", JSON.stringify(alunos));
  }, [alunos]);

  useEffect(() => {
    localStorage.setItem("pf-gastos", String(gastos));
  }, [gastos]);

  const totalReceber = useMemo(() => alunos.reduce((s, a) => s + a.valor, 0), [alunos]);
  const totalRecebido = useMemo(() => alunos.filter(a => a.pago).reduce((s, a) => s + a.valor, 0), [alunos]);
  const totalPendente = useMemo(() => alunos.filter(a => !a.pago).reduce((s, a) => s + a.valor, 0), [alunos]);
  const lucroLiquido = totalRecebido - gastos;
  const hoje = new Date().getDate();

  const togglePago = (id) => {
    setAlunos(prev => prev.map(a => a.id === id ? { ...a, pago: !a.pago } : a));
  };

  const deletar = (id) => {
    setAlunos(prev => prev.filter(a => a.id !== id));
  };

  const salvarAluno = () => {
    if (!novoAluno.nome || !novoAluno.valor || !novoAluno.vencimento) return;
    if (editando !== null) {
      setAlunos(prev => prev.map(a => a.id === editando ? { ...a, ...novoAluno, valor: Number(novoAluno.valor), vencimento: Number(novoAluno.vencimento) } : a));
      setEditando(null);
    } else {
      const novo = { ...novoAluno, id: Date.now(), valor: Number(novoAluno.valor), vencimento: Number(novoAluno.vencimento), pago: false };
      setAlunos(prev => [...prev, novo]);
    }
    setNovoAluno({ nome: "", valor: "", vencimento: "", dupla: false });
    setShowModal(false);
  };

  const abrirEdicao = (a) => {
    setNovoAluno({ nome: a.nome, valor: String(a.valor), vencimento: String(a.vencimento), dupla: a.dupla });
    setEditando(a.id);
    setShowModal(true);
  };

  const alunosOrdenados = [...alunos].sort((a, b) => a.vencimento - b.vencimento);
  const atrasados = alunos.filter(a => !a.pago && a.vencimento < hoje);
  const venceHoje = alunos.filter(a => !a.pago && a.vencimento === hoje);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f8", minHeight: "100vh", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a5c38 0%, #27ae60 100%)", padding: "24px 24px 0", color: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>💪 Personal Finance</h1>
          <p style={{ margin: "4px 0 20px", opacity: 0.85, fontSize: 13 }}>Controle financeiro do seu negócio</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingBottom: 24 }}>
            {[
              { label: "A Receber", val: fmt(totalReceber), bg: "rgba(255,255,255,0.15)" },
              { label: "Recebido", val: fmt(totalRecebido), bg: "rgba(255,255,255,0.25)" },
              { label: "Pendente", val: fmt(totalPendente), bg: "rgba(231,76,60,0.4)" },
            ].map(card => (
              <div key={card.label} style={{ background: card.bg, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{card.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {[["alunos", "👥 Alunos"], ["financeiro", "💰 Financeiro"], ["divisao", "🍕 Divisão"]].map(([key, label]) => (
              <button key={key} onClick={() => setAba(key)} style={{
                padding: "10px 18px", border: "none", cursor: "pointer", borderRadius: "10px 10px 0 0",
                background: aba === key ? "#fff" : "transparent",
                color: aba === key ? "#1a5c38" : "#fff",
                fontWeight: aba === key ? 700 : 500, fontSize: 13, transition: "all 0.2s"
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>

        {/* ABA ALUNOS */}
        {aba === "alunos" && (
          <div>
            {atrasados.length > 0 && (
              <div style={{ background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 10, padding: "12px 16px", marginBottom: 12, fontSize: 13 }}>
                <strong style={{ color: "#c62828" }}>❌ {atrasados.length} atrasado{atrasados.length > 1 ? "s" : ""}:</strong>{" "}
                {atrasados.map(a => a.nome).join(", ")}
              </div>
            )}
            {venceHoje.length > 0 && (
              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", marginBottom: 12, fontSize: 13 }}>
                <strong style={{ color: "#f57f17" }}>⏰ Vence hoje:</strong>{" "}
                {venceHoje.map(a => a.nome).join(", ")}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button onClick={() => { setNovoAluno({ nome: "", valor: "", vencimento: "", dupla: false }); setEditando(null); setShowModal(true); }} style={{
                background: "#27ae60", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13
              }}>+ Novo Aluno</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alunosOrdenados.map(a => {
                const atrasado = !a.pago && a.vencimento < hoje;
                const hojeVence = !a.pago && a.vencimento === hoje;
                const borderColor = a.pago ? "#27ae60" : atrasado ? "#e74c3c" : hojeVence ? "#f39c12" : "#dde";
                const bgCard = a.pago ? "#f0fff4" : atrasado ? "#fff5f5" : hojeVence ? "#fffbf0" : "#fff";

                return (
                  <div key={a.id} style={{
                    background: bgCard, borderRadius: 12, padding: "14px 16px",
                    border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                  }}>
                    <div onClick={() => togglePago(a.id)} style={{
                      width: 26, height: 26, borderRadius: "50%", border: `2px solid ${borderColor}`,
                      background: a.pago ? "#27ae60" : "#fff", cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14
                    }}>{a.pago ? "✓" : ""}</div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6 }}>
                        {a.nome}
                        {a.dupla && <span style={{ fontSize: 10, background: "#e3f2fd", color: "#1565c0", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>DUPLA</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                        Vence dia <strong>{a.vencimento}</strong>
                        {atrasado && <span style={{ color: "#e74c3c", fontWeight: 700 }}> · ATRASADO</span>}
                        {hojeVence && <span style={{ color: "#f39c12", fontWeight: 700 }}> · HOJE</span>}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: a.pago ? "#27ae60" : "#1a1a2e" }}>{fmt(a.valor)}</div>
                      <div style={{ fontSize: 11, color: a.pago ? "#27ae60" : "#aaa", fontWeight: 600 }}>{a.pago ? "✅ Pago" : "⏳ Pendente"}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button onClick={() => abrirEdicao(a)} style={{ background: "#e3f2fd", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
                      <button onClick={() => deletar(a.id)} style={{ background: "#fdecea", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA FINANCEIRO */}
        {aba === "financeiro" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#1a5c38", fontSize: 16 }}>📊 Visão do Mês</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Total a Receber", val: fmt(totalReceber), cor: "#1a5c38" },
                  { label: "Total Recebido", val: fmt(totalRecebido), cor: "#27ae60" },
                  { label: "Ainda Pendente", val: fmt(totalPendente), cor: "#e74c3c" },
                  { label: "Lucro Líquido", val: fmt(lucroLiquido), cor: lucroLiquido >= 0 ? "#1565c0" : "#e74c3c" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#f8f9fa", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: item.cor }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 14px", color: "#c62828", fontSize: 16 }}>💸 Gastos Fixos Mensais</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#555" }}>Total de gastos fixos (R$):</span>
                <input
                  type="number"
                  value={gastos}
                  onChange={e => setGastos(Number(e.target.value))}
                  style={{ border: "2px solid #e0e0e0", borderRadius: 8, padding: "8px 12px", fontSize: 15, fontWeight: 700, width: 120, outline: "none" }}
                />
              </div>
              <p style={{ fontSize: 12, color: "#aaa", margin: "8px 0 0" }}>Inclua: aluguel, alimentação, transporte, plano de saúde, etc.</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#333" }}>📈 Progresso do Mês</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 6 }}>
                <span>Recebido: {fmt(totalRecebido)}</span>
                <span>Meta: {fmt(totalReceber)}</span>
              </div>
              <div style={{ background: "#e0e0e0", borderRadius: 100, height: 14 }}>
                <div style={{
                  background: "linear-gradient(90deg, #27ae60, #2ecc71)",
                  borderRadius: 100, height: 14,
                  width: `${totalReceber > 0 ? Math.min(100, (totalRecebido / totalReceber) * 100) : 0}%`,
                  transition: "width 0.5s"
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#27ae60", fontWeight: 700, marginTop: 4 }}>
                {totalReceber > 0 ? Math.round((totalRecebido / totalReceber) * 100) : 0}% recebido
              </div>

              <div style={{ marginTop: 16, padding: 14, background: "#fff8e1", borderRadius: 10, border: "1px solid #ffe082" }}>
                <strong style={{ fontSize: 13, color: "#f57f17" }}>⚠️ Quando se preocupar com reajuste?</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12, color: "#555", lineHeight: 1.8 }}>
                  <li>Inflação acima de 5% no ano</li>
                  <li>Aluno há mais de 12 meses sem reajuste</li>
                  <li>Você fez nova certificação ou aumentou serviços</li>
                  <li>Seus custos fixos subiram mais de 10%</li>
                  <li>Você tem lista de espera com interessados</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ABA DIVISÃO */}
        {aba === "divisao" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#333" }}>🍕 Como dividir seu dinheiro</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#888" }}>Baseado no valor já recebido este mês</p>
              <div style={{ background: "#f8f9fa", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>💵 Faturamento base:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#27ae60" }}>{fmt(totalRecebido)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DIVISAO.map(d => (
                  <div key={d.label} style={{ background: d.cor, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: d.corTexto }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{d.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: d.corTexto }}>{fmt(totalRecebido * d.pct)}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{Math.round(d.pct * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#e8f5e9", borderRadius: 14, padding: 16, fontSize: 12, color: "#2e7d32", border: "1px solid #a5d6a7" }}>
              <strong>💡 Dica:</strong> Separe os valores assim que receber cada pagamento. Não espere o fim do mês — o dinheiro some rápido!
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", color: "#1a5c38" }}>{editando ? "✏️ Editar Aluno" : "➕ Novo Aluno"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Nome (ou nomes da dupla)", key: "nome", type: "text", placeholder: "Ex: Ana e Pedro" },
                { label: "Valor mensal (R$)", key: "valor", type: "number", placeholder: "Ex: 450" },
                { label: "Dia do vencimento", key: "vencimento", type: "number", placeholder: "Ex: 5" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 4 }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={novoAluno[field.key]}
                    onChange={e => setNovoAluno(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "10px 12px", fontSize: 14, boxSizing: "border-box", outline: "none" }}
                  />
                </div>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={novoAluno.dupla} onChange={e => setNovoAluno(prev => ({ ...prev, dupla: e.target.checked }))} />
                Treino em dupla
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowModal(false); setEditando(null); }} style={{ flex: 1, padding: "12px", border: "1.5px solid #e0e0e0", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={salvarAluno} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 8, background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
