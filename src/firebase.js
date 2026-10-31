import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
const configured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
export const app = configured && !demoMode ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const estadoRef = db ? doc(db, "dados", "estado") : null;
export { onSnapshot, setDoc };
