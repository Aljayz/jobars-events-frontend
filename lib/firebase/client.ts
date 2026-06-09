import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

let _auth: ReturnType<typeof getAuth> | null = null;

export function firebaseAuth() {
  if (_auth) return _auth;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error(
      "Firebase config missing — ensure NEXT_PUBLIC_FIREBASE_* env vars are set " +
      "and marked as Plaintext (not Encrypted) in Vercel so Next.js can inline them at build time"
    );
  }
  const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  _auth = getAuth(app);
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_EMULATOR) {
    connectAuthEmulator(_auth, "http://localhost:9099");
  }
  return _auth;
}
