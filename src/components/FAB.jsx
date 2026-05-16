export default function FAB({ open, onToggle, onNovoAluno, onNovaDespesa }) {
  const items = [
    { label: "Nova Despesa", icon: "💸", onClick: onNovaDespesa, bg: "#fff", cor: "#e53935", border: "#fde" },
    { label: "Novo Aluno",   icon: "👤", onClick: onNovoAluno,  bg: "#fff", cor: "#1a5c38", border: "#e8f5e9" },
  ];

  return (
    <>
      {open && (
        <div onClick={onToggle} style={{ position: "fixed", inset: 0, zIndex: 300 }} />
      )}

      <div style={{ position: "fixed", bottom: "calc(76px + env(safe-area-inset-bottom, 0px))", right: 20, zIndex: 400, display: "flex", flexDirection: "column-reverse", gap: 8, alignItems: "flex-end" }}>
        {items.map((item, i) => (
          <button key={i} onClick={item.onClick} style={{
            background: item.bg, color: item.cor,
            border: `1.5px solid ${item.border}`,
            borderRadius: 50, padding: "11px 18px",
            fontWeight: 700, fontSize: 14, whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", gap: 7,
            transform: open ? "translateY(0) scale(1)" : `translateY(${(i + 1) * 12}px) scale(0.9)`,
            opacity: open ? 1 : 0,
            transition: `all 0.2s ease ${i * 0.05}s`,
            pointerEvents: open ? "auto" : "none",
          }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      <button onClick={onToggle} style={{
        position: "fixed",
        bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        right: 16, zIndex: 400,
        width: 54, height: 54, borderRadius: "50%",
        background: "#111",
        color: "#fff", border: "none", fontSize: 26,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        transform: open ? "rotate(45deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1,
      }}>
        +
      </button>
    </>
  );
}
