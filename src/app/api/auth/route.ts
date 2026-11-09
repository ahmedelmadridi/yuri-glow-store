import { NextResponse } from 'next/server';
import { loginAdmin } from '@/app/actions/admin-auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const result = await loginAdmin(password);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: result.message || 'كلمة المرور غير صحيحة' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في المصادقة' },
      { status: 500 }
    );
  }
}
