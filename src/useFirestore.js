import { useEffect, useRef, useState } from "react";
import { estadoRef, onSnapshot, setDoc, demoMode } from "./firebase";
import { initialAlunos } from "./constants";
import { getMesAno } from "./utils";

const RESERVA_PADRAO = { percentual: 20, valorFixo: 4000, modo: "fixo", separado: 0 };

export function useFirestore() {
  const [alunos,         setAlunos]         = useState(initialAlunos);
  const [despesas,       setDespesas]       = useState([]);
  const [orcamento,      setOrcamento]      = useState([]);
  const [historico,      setHistorico]      = useState([]);
  const [reserva,        setReserva]        = useState(RESERVA_PADRAO);
  const [pendencias,     setPendencias]     = useState([]);
  const [ocultarValores, setOcultarValores] = useState(false);
  const [gastos,         setGastos]         = useState(1500);
  const [carregando,     setCarregando]     = useState(true);

  const [erro, setErro] = useState(null);
  const [syncStatus, setSyncStatus] = useState("salvo");
  const lastState = useRef(null);
  const fromFirebase = useRef(false);
  const saveTimer    = useRef(null);

  // ── Escuta Firestore ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (demoMode) { setCarregando(false); return; }
    if (!estadoRef) { setErro(new Error("Firebase não configurado")); setSyncStatus("erro"); return; }
    const unsub = onSnapshot(estadoRef, (snap) => {
      if (!snap.exists()) {
        setErro(new Error("Documento de dados ausente"));
        setSyncStatus("erro");
        return; // Nunca recria cadastros iniciais sobre um banco vazio ou incorreto.
      }

      if (snap.metadata.hasPendingWrites) return;
      const data = snap.data();
      setErro(null);

      fromFirebase.current = true;
      setAlunos(data.alunos ?? initialAlunos);
      setDespesas(data.despesas ?? []);
      setOrcamento(data.orcamento ?? []);
      setHistorico(data.historico ?? []);
      setReserva(data.reserva ?? RESERVA_PADRAO);
      setPendencias(data.pendencias ?? []);
      setGastos(data.gastos ?? 1500);
      setOcultarValores(data.ocultarValores ?? false);
      setCarregando(false);
    }, (error) => {
      setErro(error); setSyncStatus("erro");
    });
    return () => { unsub(); clearTimeout(saveTimer.current); };
  }, []);

  // ── Salva no Firestore (debounced 500ms) ──────────────────────────────────────
  const salvar = (estado) => {
    if (demoMode || !estadoRef) return;
    lastState.current = estado;
    setSyncStatus("salvando");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDoc(estadoRef, { ...estado, mes: getMesAno() }, { merge: true })
        .then(() => { setSyncStatus("salvo"); setErro(null); })
        .catch(error => { setErro(error); setSyncStatus("erro"); });
    }, 500);
  };

  return {
    carregando, erro, syncStatus,
    tentarNovamente: () => { if (lastState.current) salvar(lastState.current); else window.location.reload(); },
    alunos, setAlunos,
    despesas, setDespesas,
    orcamento, setOrcamento,
    historico, setHistorico,
    reserva, setReserva,
    pendencias, setPendencias,
    gastos, setGastos,
    ocultarValores, setOcultarValores,
    fromFirebase,
    salvar,
  };
}
