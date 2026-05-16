const TABS = [
  { key: "dashboard", icon: "⬜", emoji: "📊", label: "Início" },
  { key: "alunos",    icon: "⬜", emoji: "👥", label: "Alunos" },
  { key: "despesas",  icon: "⬜", emoji: "💸", label: "Despesas" },
  { key: "grafico",   icon: "⬜", emoji: "📈", label: "Gráfico" },
  { key: "divisao",   icon: "⬜", emoji: "🍕", label: "Divisão" },
];

export default function BottomNav({ aba, onAbaChange }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #f0f0f0",
      display: "flex", justifyContent: "space-around",
      height: "calc(60px + env(safe-area-inset-bottom, 0px))",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {TABS.map(t => {
        const ativo = aba === t.key;
        return (
          <button key={t.key} onClick={() => onAbaChange(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 3, border: "none",
            background: "transparent", padding: "6px 0",
            color: ativo ? "#27ae60" : "#bbb",
            transition: "color 0.15s",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1, filter: ativo ? "none" : "grayscale(1) opacity(0.4)" }}>{t.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: ativo ? 700 : 500, letterSpacing: 0.2 }}>{t.label}</span>
            {ativo && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#27ae60" }} />}
          </button>
        );
      })}
    </div>
  );
}
