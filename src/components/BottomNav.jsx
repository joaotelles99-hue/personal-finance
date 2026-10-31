const TABS = [
  { key: "dashboard", icon: "◫", label: "Visão geral" },
  { key: "alunos", icon: "♧", label: "Alunos" },
  { key: "despesas", icon: "↗", label: "Despesas" },
  { key: "grafico", icon: "▥", label: "Histórico" },
  { key: "divisao", icon: "◷", label: "Planejamento" },
];
export default function BottomNav({aba,onAbaChange}) {
 return <nav className="navigation" aria-label="Navegação principal">{TABS.map(t=><button key={t.key} aria-current={aba===t.key?"page":undefined} onClick={()=>onAbaChange(t.key)}><span aria-hidden="true">{t.icon}</span>{t.label}</button>)}</nav>;
}
