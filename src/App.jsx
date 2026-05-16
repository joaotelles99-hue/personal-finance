import { useState, useMemo, useEffect } from "react";
import { useFirestore } from "./useFirestore";
import { valorRecebido, valorPendente, getMesNome, totalDespesasPagas, totalDespesasPrevistas, resetarDespesasParaMes, calcularProjecao } from "./utils";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import FAB from "./components/FAB";
import AlunoModal from "./components/modals/AlunoModal";
import DespesaModal from "./components/modals/DespesaModal";
import DashboardTab from "./components/tabs/DashboardTab";
import AlunosTab from "./components/tabs/AlunosTab";
import DespesasTab from "./components/tabs/DespesasTab";
import GraficoTab from "./components/tabs/GraficoTab";
import DivisaoTab from "./components/tabs/DivisaoTab";

export default function App() {
  const {
    carregando,
    alunos, setAlunos,
    despesas, setDespesas,
    orcamento, setOrcamento,
    historico, setHistorico,
    gastos,
    ocultarValores, setOcultarValores,
    fromFirebase,
    salvar,
  } = useFirestore();

  const [aba,      setAba]      = useState("dashboard");
  const [fabOpen,  setFabOpen]  = useState(false);
  const [modal,    setModal]    = useState(null); // null | { tipo: 'aluno'|'despesa', editando: obj|null }

  // ── Sincroniza Firebase ao mudar estado ──────────────────────────────────
  useEffect(() => {
    if (fromFirebase.current) { fromFirebase.current = false; return; }
    if (carregando) return;
    salvar({ alunos, despesas, orcamento, historico, gastos, ocultarValores });
  }, [alunos, despesas, orcamento, historico, gastos, ocultarValores]);

  // ── Totais ────────────────────────────────────────────────────────────────
  const totalPrevisto  = useMemo(() => alunos.reduce((s, a) => s + a.valor, 0), [alunos]);
  const totalRecebido  = useMemo(() => alunos.reduce((s, a) => s + valorRecebido(a), 0), [alunos]);
  const totalPendente  = useMemo(() => alunos.reduce((s, a) => s + valorPendente(a), 0), [alunos]);
  const despPagas      = useMemo(() => totalDespesasPagas(despesas), [despesas]);
  const despPrevistas  = useMemo(() => totalDespesasPrevistas(despesas), [despesas]);
  const saldo          = totalRecebido - despPagas;
  const projecao       = useMemo(() => calcularProjecao(alunos, despesas), [alunos, despesas]);

  // ── Fechar mês ────────────────────────────────────────────────────────────
  const resetarMes = () => {
    if (!window.confirm(`Fechar ${getMesNome()} e começar novo mês?`)) return;
    const hist = [...historico, {
      mes: getMesNome(),
      total: totalRecebido,
      totalPrevisto,
      totalPendente,
      despPagas,
      despPrevistas,
      alunos: alunos.map(a => ({ ...a })),
      despesas: despesas.map(d => ({ ...d })),
    }];
    if (hist.length > 24) hist.shift();
    setHistorico(hist);
    setAlunos(prev => prev.map(a =>
      a.dupla ? { ...a, pago: false, pago1: false, pago2: false } : { ...a, pago: false }
    ));
    setDespesas(prev => resetarDespesasParaMes(prev));
  };

  // ── Ações alunos ──────────────────────────────────────────────────────────
  const togglePago  = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago: !a.pago } : a));
  const togglePago1 = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago1: !a.pago1 } : a));
  const togglePago2 = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago2: !a.pago2 } : a));
  const deletarAluno = (id) => setAlunos(p => p.filter(a => a.id !== id));
  const salvarAluno = (aluno) => {
    if (aluno.id && alunos.find(a => a.id === aluno.id)) {
      setAlunos(p => p.map(a => a.id === aluno.id ? aluno : a));
    } else {
      setAlunos(p => [...p, { ...aluno, id: Date.now() }]);
    }
    setModal(null);
  };

  // ── Ações despesas ────────────────────────────────────────────────────────
  const toggleDespesaPago = (id) => setDespesas(p => p.map(d => d.id === id ? { ...d, pago: !d.pago } : d));
  const toggleDespesaFixado = (id) => setDespesas(p => p.map(d => d.id === id ? { ...d, fixado: !d.fixado } : d));
  const deletarDespesa = (id) => setDespesas(p => p.filter(d => d.id !== id));
  const salvarDespesa = (despesa) => {
    if (despesa.id && despesas.find(d => d.id === despesa.id)) {
      setDespesas(p => p.map(d => d.id === despesa.id ? despesa : d));
    } else {
      setDespesas(p => [...p, { ...despesa, id: Date.now().toString() }]);
    }
    setModal(null);
  };

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif", flexDirection: "column", gap: 16, color: "#1a5c38" }}>
        <div style={{ fontSize: 48 }}>💪</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: "#f0f4f8", minHeight: "100vh", paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>
      <Header
        mesNome={getMesNome()}
        totalPrevisto={totalPrevisto}
        totalRecebido={totalRecebido}
        totalPendente={totalPendente}
        ocultarValores={ocultarValores}
        onToggleOcultar={() => setOcultarValores(v => !v)}
        onResetarMes={resetarMes}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 16px 0" }}>
        {aba === "dashboard" && (
          <DashboardTab
            totalPrevisto={totalPrevisto} totalRecebido={totalRecebido}
            totalPendente={totalPendente} despPagas={despPagas}
            despPrevistas={despPrevistas} saldo={saldo}
            alunos={alunos} despesas={despesas}
            ocultarValores={ocultarValores}
            projecao={projecao}
          />
        )}
        {aba === "alunos" && (
          <AlunosTab
            alunos={alunos} ocultarValores={ocultarValores}
            onTogglePago={togglePago} onTogglePago1={togglePago1} onTogglePago2={togglePago2}
            onEditar={(a) => setModal({ tipo: "aluno", editando: a })}
            onDeletar={deletarAluno}
          />
        )}
        {aba === "despesas" && (
          <DespesasTab
            despesas={despesas} ocultarValores={ocultarValores}
            onTogglePago={toggleDespesaPago}
            onToggleFixado={toggleDespesaFixado}
            onEditar={(d) => setModal({ tipo: "despesa", editando: d })}
            onDeletar={deletarDespesa}
          />
        )}
        {aba === "grafico" && (
          <GraficoTab
            historico={historico} totalRecebido={totalRecebido}
            totalPrevisto={totalPrevisto} ocultarValores={ocultarValores}
          />
        )}
        {aba === "divisao" && (
          <DivisaoTab
            totalRecebido={totalRecebido} despesas={despesas}
            orcamento={orcamento} ocultarValores={ocultarValores}
            onAtualizarOrcamento={setOrcamento}
          />
        )}
      </div>

      <BottomNav aba={aba} onAbaChange={setAba} />

      <FAB
        open={fabOpen} onToggle={() => setFabOpen(v => !v)}
        onNovoAluno={() => { setFabOpen(false); setModal({ tipo: "aluno", editando: null }); }}
        onNovaDespesa={() => { setFabOpen(false); setModal({ tipo: "despesa", editando: null }); }}
      />

      {modal?.tipo === "aluno" && (
        <AlunoModal editando={modal.editando} onSalvar={salvarAluno} onFechar={() => setModal(null)} />
      )}
      {modal?.tipo === "despesa" && (
        <DespesaModal editando={modal.editando} onSalvar={salvarDespesa} onFechar={() => setModal(null)} />
      )}
    </div>
  );
}
