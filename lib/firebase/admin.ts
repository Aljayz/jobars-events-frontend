import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import type { JWTPayload } from "jose";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

function decodeBase64(str: string): string {
  if (typeof Buffer === "undefined") {
    return new TextDecoder().decode(
      new Uint8Array(atob(str).split("").map((c) => c.charCodeAt(0))),
    );
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

function getAdminAuth() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(decodeBase64(raw))) });
  }
  return getAuth();
}

function getSessionSigningKey() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  const sa = JSON.parse(decodeBase64(raw)) as Record<string, string>;
  return new TextEncoder().encode(sa.private_key.slice(-64));
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  role: string;
  client_mode: boolean;
  full_name: string | null;
  email_verified: boolean;
  avatar_url: string | null;
}

function mapFirebaseUser(payload: JWTPayload): FirebaseUser {
  return {
    uid: (payload.uid as string) ?? payload.sub ?? "",
    email: (payload.email as string) ?? null,
    role: (payload.role as string) ?? "external-client",
    client_mode: (payload.client_mode as boolean) ?? false,
    full_name: (payload.full_name as string) ?? (payload.name as string) ?? null,
    email_verified: (payload.email_verified as boolean) ?? false,
    avatar_url: (payload.picture as string) ?? (payload.avatar_url as string) ?? null,
  };
}

export async function verifyIdToken(token: string): Promise<FirebaseUser | null> {
  try {
    if (!PROJECT_ID) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return mapFirebaseUser(payload);
  } catch {
    return null;
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  const user = await verifyIdToken(idToken);
  if (!user) throw new Error("Invalid ID token");
  const key = getSessionSigningKey();
  return await new SignJWT({ ...user } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.uid)
    .setIssuedAt()
    .setExpirationTime("14d")
    .setIssuer("jobars-events")
    .sign(key);
}

export async function verifySessionCookie(session: string): Promise<FirebaseUser | null> {
  try {
    const key = getSessionSigningKey();
    const { payload } = await jwtVerify(session, key, { issuer: "jobars-events" });
    return mapFirebaseUser(payload);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Session cookie verification failed:", error);
    }
    return null;
  }
}

export async function adminCreateUser(email: string, password: string, displayName: string): Promise<string> {
  const user = await getAdminAuth().createUser({ email, password, displayName });
  return user.uid;
}

export async function adminSetCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
  await getAdminAuth().setCustomUserClaims(uid, claims);
}

export async function adminGetUserByEmail(email: string): Promise<{ uid: string } | null> {
  try {
    const user = await getAdminAuth().getUserByEmail(email);
    return { uid: user.uid };
  } catch {
    return null;
  }
}

export async function adminDeleteUser(uid: string): Promise<void> {
  await getAdminAuth().deleteUser(uid);
}

export async function adminRevokeRefreshTokens(uid: string): Promise<void> {
  await getAdminAuth().revokeRefreshTokens(uid);
}
