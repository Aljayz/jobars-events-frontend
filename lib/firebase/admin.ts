import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, "base64").toString("utf-8"),
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://jobars-events-3df9c-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export const adminAuth = getAuth();

export interface FirebaseUser {
  uid: string;
  email: string | null;
  role: string;
  client_mode: boolean;
  full_name: string | null;
  email_verified: boolean;
}

export function mapFirebaseUser(decoded: DecodedIdToken): FirebaseUser {
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    role: (decoded.role as string) ?? "external-client",
    client_mode: (decoded.client_mode as boolean) ?? false,
    full_name: (decoded.full_name as string) ?? decoded.name ?? null,
    email_verified: decoded.email_verified ?? false,
  };
}

export async function verifySessionCookie(session: string): Promise<FirebaseUser | null> {
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return mapFirebaseUser(decoded);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Firebase session cookie verification failed:", error);
    }
    return null;
  }
}

export async function verifyIdToken(token: string): Promise<FirebaseUser | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return mapFirebaseUser(decoded);
  } catch {
    return null;
  }
}
