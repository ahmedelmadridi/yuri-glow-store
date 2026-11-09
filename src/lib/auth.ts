import { cookies } from 'next/headers';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/session';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get(ADMIN_COOKIE_NAME);
  
  if (!adminSession?.value) {
    throw new Error('Unauthorized: Admin access required');
  }

  const isValid = await verifySessionToken(adminSession.value);
  if (!isValid) {
    throw new Error('Unauthorized: Invalid or expired admin session');
  }
}
