import { SignJWT, jwtVerify } from "jose";

const COOKIE = "friday_member";

function getSecret() {
  const raw = process.env.SUBSCRIPTION_SECRET;
  if (raw && raw.length >= 16) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("dev-only-friday-session-secret-min-32!");
  }
  throw new Error("SUBSCRIPTION_SECRET manquant ou trop court (min 16 caractères).");
}

export async function signMemberSession(email: string) {
  const secret = getSecret();
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60d")
    .sign(secret);
}

export async function verifyMemberSession(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    const email = typeof payload.email === "string" ? payload.email : null;
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export const MEMBER_COOKIE = COOKIE;
