import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // We use an environment variable or a default fallback for MVP
    const adminPassword = process.env.ADMIN_PASSWORD || 'yuriglow2026';
    
    if (password === adminPassword) {
      // Return success and let the client handle cookie setting
      // This is more reliable for local network testing on mobile devices
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, message: 'كلمة المرور غير صحيحة' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
