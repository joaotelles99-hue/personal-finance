import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app, demoMode } from "./firebase";
export default function AuthGate({children}) {
 const [user,setUser]=useState(undefined), [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const auth=app?getAuth(app):null;
 useEffect(()=>{if(!auth)return;return onAuthStateChanged(auth,setUser);},[auth]);
 if(demoMode)return children;
 if(!auth)return <main className="connection-error"><h1>Configuração pendente</h1><p>Configure o Firebase para acessar seus dados.</p></main>;
 const allowed=import.meta.env.VITE_OWNER_UID;
 if(user && allowed && user.uid===allowed)return <><div className="account-bar">Área privada <button onClick={()=>signOut(auth)}>Sair</button></div>{children}</>;
 if(user)return <main className="connection-error"><h1>Acesso não autorizado</h1><p>Esta conta não está autorizada ou o proprietário ainda não foi configurado.</p><button onClick={()=>signOut(auth)}>Sair</button></main>;
 if(user===undefined)return <main className="connection-error">Verificando acesso…</main>;
 return <main className="login panel"><span className="eyebrow">PERSONAL FINANCE</span><h1>Seu espaço financeiro.</h1><p>Entre com sua conta para continuar.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError("");try{await signInWithEmailAndPassword(auth,email,password);}catch{setError("Não foi possível entrar. Confira os dados e sua conexão.");}finally{setBusy(false);}}}><label>E-mail<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={busy}>{busy?"Entrando…":"Entrar"}</button></form></main>;
}
