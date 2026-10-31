export default function FAB({open,onToggle,onNovoAluno,onNovaDespesa}) {
 return <div className="quick-actions">{open && <><button onClick={onNovoAluno}>+ Novo aluno</button><button onClick={onNovaDespesa}>+ Nova despesa</button></>}<button className="quick-toggle" onClick={onToggle} aria-expanded={open} aria-label={open?"Fechar ações":"Adicionar cadastro"}>{open?"×":"+"}</button></div>;
}
