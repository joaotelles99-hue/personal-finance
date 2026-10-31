import { demoMode } from "./firebase";
import { useState, useMemo, useEffect } from "react";
import { useFirestore } from "./useFirestore";
import {
  valorRecebido, valorPendente, getMesNome, getMesAno,
  totalDespesasPagas, totalDespesasPrevistas, resetarDespesasParaMes,
  calcularProjecao, calcularReservaInfo, calcularLimiteGastos, calcularInadimplencia,
} from "./utils";
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
    carregando, erro, syncStatus, tentarNovamente,
    alunos, setAlunos,
    despesas, setDespesas,
    orcamento, setOrcamento,
    historico, setHistorico,
    reserva, setReserva,
    pendencias, setPendencias,
    gastos,
    ocultarValores, setOcultarValores,
    fromFirebase,
    salvar,
  } = useFirestore();

  const [aba,     setAba]     = useState("dashboard");
  const [fabOpen, setFabOpen] = useState(false);
  const [modal,   setModal]   = useState(null);

  // ── Sincroniza Firebase ao mudar estado ──────────────────────────────────────
  useEffect(() => {
    if (fromFirebase.current) { fromFirebase.current = false; return; }
    if (carregando) return;
    salvar({ alunos, despesas, orcamento, historico, gastos, ocultarValores, reserva, pendencias });
  }, [alunos, despesas, orcamento, historico, gastos, ocultarValores, reserva, pendencias]);

  // ── Totais ────────────────────────────────────────────────────────────────────
  const totalPrevisto  = useMemo(() => alunos.reduce((s, a) => s + a.valor, 0), [alunos]);
  const totalRecebido  = useMemo(() => alunos.reduce((s, a) => s + valorRecebido(a), 0), [alunos]);
  const totalPendente  = useMemo(() => alunos.reduce((s, a) => s + valorPendente(a), 0), [alunos]);
  const despPagas      = useMemo(() => totalDespesasPagas(despesas), [despesas]);
  const despPrevistas  = useMemo(() => totalDespesasPrevistas(despesas), [despesas]);
  const saldo          = totalRecebido - despPagas;

  const projecao       = useMemo(() => calcularProjecao(alunos, despesas), [alunos, despesas]);
  const reservaInfo    = useMemo(() => calcularReservaInfo(reserva, totalRecebido), [reserva, totalRecebido]);
  const limiteGastos   = useMemo(() => calcularLimiteGastos(reserva, totalPrevisto, despesas), [reserva, totalPrevisto, despesas]);
  const inadimplencia  = useMemo(() => calcularInadimplencia(alunos, pendencias), [alunos, pendencias]);

  // ── Fechar mês ────────────────────────────────────────────────────────────────
  const resetarMes = () => {
    if (!window.confirm(`Fechar ${getMesNome()} e começar novo mês?`)) return;

    // Gera pendências para alunos que não pagaram
    const novasPendencias = [];
    alunos.forEach(a => {
      const pendente = valorPendente(a);
      if (pendente > 0) {
        novasPendencias.push({
          id: `${a.id}-${getMesAno()}`,
          alunoId: a.id,
          alunoNome: a.nome,
          mes: getMesNome(),
          valorOriginal: a.valor,
          valorPendente: pendente,
          pago: false,
          observacao: null,
        });
      }
    });

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
      a.dupla ? { ...a, pago: false, pago1: false, pago2: false, formaPagamento1: "", formaPagamento2: "" } : { ...a, pago: false, formaPagamento: "" }
    ));
    setDespesas(prev => resetarDespesasParaMes(prev));
    setPendencias(prev => [...prev, ...novasPendencias]);
    setReserva(prev => ({ ...prev, separado: 0 }));
  };

  // ── Ações alunos ──────────────────────────────────────────────────────────────
  const togglePago  = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago: !a.pago } : a));
  const togglePago1 = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago1: !a.pago1 } : a));
  const togglePago2 = (id) => setAlunos(p => p.map(a => a.id === id ? { ...a, pago2: !a.pago2 } : a));
  const deletarAluno = (id) => {
    if (window.confirm("Remover este cadastro? Baixe um backup antes se precisar guardar os dados.")) setAlunos(p => p.filter(a => a.id !== id));
  };
  const salvarAluno = (aluno) => {
    if (aluno.id && alunos.find(a => a.id === aluno.id)) {
      setAlunos(p => p.map(a => a.id === aluno.id ? aluno : a));
    } else {
      setAlunos(p => [...p, { ...aluno, id: Date.now() }]);
    }
    setModal(null);
  };

  // ── Ações despesas ────────────────────────────────────────────────────────────
  const toggleDespesaPago    = (id) => setDespesas(p => p.map(d => d.id === id ? { ...d, pago: !d.pago } : d));
  const toggleDespesaFixado  = (id) => setDespesas(p => p.map(d => d.id === id ? { ...d, fixado: !d.fixado } : d));
  const deletarDespesa = (id) => {
    if (window.confirm("Remover esta despesa?")) setDespesas(p => p.filter(d => d.id !== id));
  };
  const salvarDespesa = (despesa) => {
    if (despesa.id && despesas.find(d => d.id === despesa.id)) {
      setDespesas(p => p.map(d => d.id === despesa.id ? despesa : d));
    } else {
      setDespesas(p => [...p, { ...despesa, id: Date.now().toString() }]);
    }
    setModal(null);
  };

  // ── Ações pendências ──────────────────────────────────────────────────────────
  const pagarPendencia  = (id) => setPendencias(p => p.map(x => x.id === id ? { ...x, pago: true } : x));
  const editarObsPendencia = (id, obs) => setPendencias(p => p.map(x => x.id === id ? { ...x, observacao: obs } : x));

  const baixarBackup = () => {
    const dados = { formato: "personal-finance", versao: 1, exportadoEm: new Date().toISOString(), alunos, despesas, orcamento, historico, gastos, ocultarValores, reserva, pendencias };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `personal-finance-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url);
  };

  if (erro && carregando) return <main className="connection-error" role="alert"><h1>Não foi possível abrir seus dados.</h1><p>Confira a conexão e as configurações do Firebase. Nenhum cadastro foi substituído.</p><button onClick={() => window.location.reload()}>Tentar novamente</button></main>;
  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif", flexDirection: "column", gap: 16, color: "#1a5c38" }}>
        <div style={{ fontSize: 48 }}>💪</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {demoMode && <div className="demo-banner">PRÉVIA · Dados de exemplo. As alterações não são salvas no Firebase.</div>}
      <Header
        mesNome={getMesNome()}
        onBackup={baixarBackup} syncStatus={syncStatus} onRetry={tentarNovamente}
        totalPrevisto={totalPrevisto}
        totalRecebido={totalRecebido}
        totalPendente={totalPendente}
        ocultarValores={ocultarValores}
        onToggleOcultar={() => setOcultarValores(v => !v)}
        onResetarMes={resetarMes}
      />

      <main className="main-content">
        {aba === "dashboard" && (
          <DashboardTab
            totalPrevisto={totalPrevisto} totalRecebido={totalRecebido}
            totalPendente={totalPendente} despPagas={despPagas}
            despPrevistas={despPrevistas} saldo={saldo}
            alunos={alunos} despesas={despesas}
            ocultarValores={ocultarValores}
            projecao={projecao}
            reservaInfo={reservaInfo}
            limiteGastos={limiteGastos}
            inadimplencia={inadimplencia}
            pendencias={pendencias}
            onPagarPendencia={pagarPendencia}
          />
        )}
        {aba === "alunos" && (
          <AlunosTab
            onPagamento={(id,campo,valor)=>setAlunos(p=>p.map(a=>a.id===id?{...a,[campo]:valor}:a))}
            alunos={alunos} ocultarValores={ocultarValores}
            onTogglePago={togglePago} onTogglePago1={togglePago1} onTogglePago2={togglePago2}
            onEditar={(a) => setModal({ tipo: "aluno", editando: a })}
            onDeletar={deletarAluno}
            pendencias={pendencias}
            onPagarPendencia={pagarPendencia}
            onEditarObsPendencia={editarObsPendencia}
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
            reserva={reserva}
            onAtualizarReserva={setReserva}
            reservaInfo={reservaInfo}
          />
        )}
      </main>

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
