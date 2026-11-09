import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * تجزئة كلمة المرور باستخدام PBKDF2 مع salt عشوائي
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * مقارنة آمنة لكلمة المرور المدخلة مع التجزئة المخزنة لمنع هجمات التوقيت
 */
export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  try {
    const { hash } = hashPassword(password, storedSalt);
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (hashBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch (error) {
    return false;
  }
}
