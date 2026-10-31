import { fmtValor } from "../utils";
export default function Header({ mesNome, totalPrevisto, totalRecebido, totalPendente, ocultarValores, onToggleOcultar, onResetarMes, onBackup, syncStatus, onRetry }) {
  return <header className="header">
    <div className="header-top"><a className="brand" href="#"><span className="brand-mark">pf<span>·</span></span><span>Personal Finance<small>SEU TRABALHO. SUAS CONQUISTAS.</small></span></a><div className="header-actions">
      <button aria-label={ocultarValores ? "Mostrar valores" : "Ocultar valores"} onClick={onToggleOcultar}>{ocultarValores ? "Mostrar valores" : "Ocultar valores"}</button>
      <button onClick={onBackup}>Baixar backup</button><button onClick={onResetarMes}>Fechar mês ↗</button>
    </div></div>
    <div className="period"><span>{mesNome}</span><span role="status" className={`sync ${syncStatus}`}>{syncStatus === "salvando" ? "◌ Salvando alterações…" : syncStatus === "erro" ? <button onClick={onRetry}>Falha na sincronização · Tentar novamente</button> : "● Sincronizado"}</span></div>
    <div className="kpis">{[
      {label:"Receita prevista",value:totalPrevisto,sub:"Total dos cadastros do mês",cls:""},
      {label:"Recebido",value:totalRecebido,sub:"Pagamentos confirmados",cls:"received"},
      {label:"Falta receber",value:totalPendente,sub:"Inclui valores ainda não vencidos",cls:"pending"},
    ].map(c=><article className={`kpi ${c.cls}`} key={c.label}><span>{c.label}</span><strong>{fmtValor(c.value,ocultarValores)}</strong><small>{c.sub}</small></article>)}</div>
  </header>;
}
