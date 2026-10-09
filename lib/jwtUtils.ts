/**
 * JWT Utilities - Social Red
 * Provides JWT token generation and verification for enhanced security
 */

import crypto from "crypto";

interface TokenPayload {
  sub: string; // subject (user ID)
  iat: number; // issued at
  exp: number; // expiration
  aud: string; // audience
  iss: string; // issuer
  scope?: string[];
}

const SECRET_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || "dev-secret-key";
const TOKEN_EXPIRATION = 3600; // 1 hour in seconds

/**
 * Generate JWT token
 */
export function generateJWT(userId: string, scope: string[] = []): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: userId,
    iat: now,
    exp: now + TOKEN_EXPIRATION,
    aud: "social-red-api",
    iss: "social-red",
    scope,
  };

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyJWT(token: string): { valid: boolean; payload?: TokenPayload } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}
