import { cookies } from 'next/headers';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (!adminSession || adminSession.value !== 'authenticated') {
    throw new Error('Unauthorized: Admin access required');
  }
}
