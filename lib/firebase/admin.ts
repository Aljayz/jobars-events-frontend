import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import type { JWTPayload } from "jose";

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

function getServiceAccount(): Record<string, string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  return JSON.parse(decodeBase64(raw));
}

function getSessionSigningKey() {
  const sa = getServiceAccount();
  return new TextEncoder().encode(sa.private_key.slice(-64));
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  role: string;
  client_mode: boolean;
  full_name: string | null;
  email_verified: boolean;
}

function mapFirebaseUser(payload: JWTPayload): FirebaseUser {
  return {
    uid: (payload.uid as string) ?? payload.sub ?? "",
    email: (payload.email as string) ?? null,
    role: (payload.role as string) ?? "external-client",
    client_mode: (payload.client_mode as boolean) ?? false,
    full_name: (payload.full_name as string) ?? null,
    email_verified: (payload.email_verified as boolean) ?? false,
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

async function getOAuth2Token(): Promise<string> {
  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const body = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.auth https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const algorithm = { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } };
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    algorithm,
    false,
    ["sign"],
  );
  const header = { alg: "RS256", typ: "JWT" };
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payload = `${b64(header)}.${b64(body)}`;
  const sig = await crypto.subtle.sign(algorithm, privateKey, new TextEncoder().encode(payload));
  const jwt = `${payload}.${b64(new Uint8Array(sig))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json() as { access_token?: string; error_description?: string };
  if (!data.access_token) throw new Error(`OAuth2 token exchange failed: ${data.error_description ?? "unknown"}`);
  return data.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN [\w ]+-----/, "").replace(/-----END [\w ]+-----/, "").replace(/\s/g, "");
  const bytes = typeof Buffer === "undefined"
    ? atob(b64).split("").map((c) => c.charCodeAt(0))
    : [...Buffer.from(b64, "base64")];
  return new Uint8Array(bytes).buffer;
}

export async function adminCreateUser(email: string, password: string, displayName: string): Promise<string> {
  const token = await getOAuth2Token();
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, password, displayName, returnSecureToken: false }),
    },
  );
  const data = await res.json() as { localId?: string; error?: { message: string } };
  if (!data.localId) throw new Error(data.error?.message ?? "Failed to create user");
  return data.localId;
}

export async function adminSetCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
  const token = await getOAuth2Token();
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ localId: uid, customAttributes: JSON.stringify(claims) }),
    },
  );
  const data = await res.json() as { error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
}

export async function adminGetUserByEmail(email: string): Promise<{ uid: string } | null> {
  const token = await getOAuth2Token();
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: [email] }),
    },
  );
  const data = await res.json() as { users?: Array<{ localId: string }>; error?: { message: string } };
  if (data.error || !data.users?.length) return null;
  return { uid: data.users[0].localId };
}

export async function adminRevokeRefreshTokens(uid: string): Promise<void> {
  const token = await getOAuth2Token();
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ localId: uid, validSince: Math.floor(Date.now() / 1000) }),
    },
  );
}
