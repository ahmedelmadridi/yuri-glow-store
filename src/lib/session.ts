/**
 * إدارة وتشفير جلسات الإدارة باستخدام Web Crypto API (متوافق مع Edge Runtime و Node.js)
 */

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || 'yuriglow-ultra-secure-admin-token-secret-2026';
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const binary = base64UrlDecode(base64Url);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(getSecretKey());
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface AdminSessionPayload {
  role: 'admin';
  exp: number; // timestamp in ms
  iat: number; // timestamp in ms
}

/**
 * إنشاء توكن جلسة مشفر وموقع رقمياً
 */
export async function createSessionToken(): Promise<string> {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_MAX_AGE * 1000,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(encodedPayload));
  const encodedSignature = bufferToBase64Url(signatureBuffer);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * التحقق من صحة التوكن وتوقيعه الرقمي وصلاحيته الزمنية
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const signatureBytes = base64UrlToUint8Array(encodedSignature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      enc.encode(encodedPayload)
    );

    if (!isValid) return false;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: AdminSessionPayload = JSON.parse(payloadJson);

    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * إعدادات الكوكي الآمن (HttpOnly / Secure / SameSite)
 */
export function getAdminCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
