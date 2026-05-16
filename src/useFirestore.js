import { useEffect, useRef, useState } from "react";
import { db, estadoRef, onSnapshot, setDoc } from "./firebase";
import { initialAlunos } from "./constants";
import { getMesAno } from "./utils";


export function useFirestore() {
  const [alunos,         setAlunos]         = useState(initialAlunos);
  const [despesas,       setDespesas]       = useState([]);
  const [orcamento,      setOrcamento]      = useState([]);
  const [historico,      setHistorico]      = useState([]);
  const [ocultarValores, setOcultarValores] = useState(false);
  const [gastos,         setGastos]         = useState(1500);
  const [carregando,     setCarregando]     = useState(true);

  const fromFirebase = useRef(false);
  const saveTimer    = useRef(null);

  // ── Escuta Firestore ───────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(estadoRef, (snap) => {
      if (!snap.exists()) {
        setDoc(estadoRef, {
          alunos: initialAlunos, despesas: [], orcamento: [], historico: [],
          gastos: 1500, ocultarValores: false, mes: getMesAno(),
        });
        setCarregando(false);
        return;
      }

      const data = snap.data();

      fromFirebase.current = true;
      setAlunos(data.alunos ?? initialAlunos);
      setDespesas(data.despesas ?? []);
      setOrcamento(data.orcamento ?? []);
      setHistorico(data.historico ?? []);
      setGastos(data.gastos ?? 1500);
      setOcultarValores(data.ocultarValores ?? false);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  // ── Salva no Firestore (debounced 500ms) ──────────────────────────────────
  const salvar = (estado) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDoc(estadoRef, { ...estado, mes: getMesAno() });
    }, 500);
  };

  return {
    carregando,
    alunos, setAlunos,
    despesas, setDespesas,
    orcamento, setOrcamento,
    historico, setHistorico,
    gastos, setGastos,
    ocultarValores, setOcultarValores,
    fromFirebase,
    salvar,
  };
}
