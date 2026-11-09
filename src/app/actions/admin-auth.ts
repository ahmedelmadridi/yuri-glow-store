'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/passwordHash';
import { sendOtpEmail, sendPasswordChangedNotification } from '@/lib/email';
import { checkCustomRateLimit } from '@/app/actions/rateLimit';

interface OtpData {
  hash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
}

interface PasswordData {
  hash: string;
  salt: string;
  updatedAt: string;
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'بريدك الإلكتروني المسجل';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `**@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * جلب إعداد أمان من قاعدة البيانات
 */
async function getSecuritySetting<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_security')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data?.value) {
      return null;
    }

    return (typeof data.value === 'string' ? JSON.parse(data.value) : data.value) as T;
  } catch (err) {
    return null;
  }
}

/**
 * حفظ إعداد أمان في قاعدة البيانات
 */
async function saveSecuritySetting(key: string, value: any): Promise<boolean> {
  try {
    const jsonValue = value;
    const { error } = await supabaseAdmin
      .from('admin_security')
      .upsert({
        key,
        value: jsonValue,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Failed to save admin_security [${key}]:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error in saveSecuritySetting [${key}]:`, err);
    return false;
  }
}

/**
 * مسح إعداد أمان من قاعدة البيانات
 */
async function deleteSecuritySetting(key: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('admin_security')
      .delete()
      .eq('key', key);
  } catch (err) {
    console.error(`Error deleting security setting [${key}]:`, err);
  }
}

/**
 * التحقق من كلمة المرور ضد قاعدة البيانات أو متغير البيئة الافتراضي
 */
async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  const storedPassword = await getSecuritySetting<PasswordData>('admin_password');

  if (storedPassword && storedPassword.hash && storedSalt(storedPassword)) {
    return verifyPassword(inputPassword, storedPassword.hash, storedPassword.salt);
  }

  // Fallback to environment variable or fallback constant if DB not set yet
  const fallbackPassword = process.env.ADMIN_PASSWORD || 'yuriglow2026';
  return inputPassword === fallbackPassword;
}

function storedSalt(pw: PasswordData): boolean {
  return typeof pw.salt === 'string' && pw.salt.length > 0;
}

/**
 * الحصول على البريد الإلكتروني للمدير
 */
export async function getAdminEmail(): Promise<string> {
  const dbEmail = await getSecuritySetting<string>('admin_email');
  return dbEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'yuri.glow.eg@gmail.com';
}

/**
 * تسجيل الدخول الآمن للوحة التحكم
 */
export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  try {
    // حماية من محاولات التخمين (Max 5 attempts per 15 minutes)
    const clientIp = 'admin-login';
    const isAllowed = await checkCustomRateLimit(`login_${clientIp}`, 5, 900);
    if (!isAllowed) {
      return {
        success: false,
        message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.',
      };
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return { success: false, message: 'كلمة المرور غير صحيحة' };
    }

    // إذا كانت كلمة المرور صحيحة ولم تكن مسجلة ومفرومة في قاعدة البيانات بعد، نقوم بتسجيلها تلقائياً
    const stored = await getSecuritySetting<PasswordData>('admin_password');
    if (!stored) {
      const { hash, salt } = hashPassword(password);
      await saveSecuritySetting('admin_password', {
        hash,
        salt,
        updatedAt: new Date().toISOString(),
      });
    }

    // إنشاء توكن الجلسة المشفر والموقع رقمياً
    const token = await createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

    return { success: true };
  } catch (err: any) {
    console.error('Login error:', err);
    return { success: false, message: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' };
  }
}

/**
 * تسجيل الخروج الآمن
 */
export async function logoutAdmin(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

/**
 * طلب إرسال رمز OTP لتأكيد تغيير كلمة المرور
 */
export async function requestPasswordChangeOtp(params?: {
  currentPassword?: string;
  isForgotPassword?: boolean;
}): Promise<{ success: boolean; message?: string; maskedEmail?: string }> {
  try {
    const isForgot = !!params?.isForgotPassword;

    // إذا لم تكن عملية نسيان كلمة المرور، يجب التأكد من صحة كلمة المرور الحالية أولاً
    if (!isForgot) {
      if (!params?.currentPassword) {
        return { success: false, message: 'يرجى إدخال كلمة المرور الحالية أولاً' };
      }
      const isCurrentValid = await verifyAdminPassword(params.currentPassword);
      if (!isCurrentValid) {
        return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
      }
    }

    // Rate limit OTP requests (1 request per 60 seconds)
    const canRequestOtp = await checkCustomRateLimit('otp_request', 2, 60);
    if (!canRequestOtp) {
      return { success: false, message: 'يرجى الانتظار دقيقة واحدة قبل طلب رمز جديد' };
    }

    const adminEmail = await getAdminEmail();
    if (!adminEmail && !process.env.SMTP_USER) {
      return {
        success: false,
        message: 'لم يتم العثور على بريد إلكتروني للمدير. يرجى ضبط ADMIN_EMAIL أو SMTP_USER في ملف البيئة.',
      };
    }

    // توليد رمز سري مكون من 6 أرقام
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { hash, salt } = hashPassword(otpCode);

    const otpData: OtpData = {
      hash,
      salt,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    };

    await saveSecuritySetting('password_reset_otp', otpData);

    const emailRes = await sendOtpEmail({
      toEmail: adminEmail,
      otpCode,
      actionTitle: isForgot ? 'استعادة كلمة المرور' : 'تغيير كلمة المرور',
    });

    return {
      success: true,
      message: emailRes.error === 'SMTP_NOT_CONFIGURED_FALLBACK_ACTIVE'
        ? 'تم إرسال الرمز عبر تيليجرام (وسيط إضافي) ويمكنك التحقق من صندوق البريد'
        : 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني بنجاح',
      maskedEmail: maskEmail(adminEmail),
    };
  } catch (err: any) {
    console.error('Request OTP error:', err);
    return { success: false, message: 'حدث خطأ أثناء إرسال رمز التحقق' };
  }
}

/**
 * تأكيد وتطبيق كلمة المرور الجديدة بعد فحص رمز الـ OTP
 */
export async function confirmPasswordChange(
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!otp || otp.trim().length !== 6) {
      return { success: false, message: 'رمز التحقق يجب أن يتكون من 6 أرقام' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات' };
    }

    const otpData = await getSecuritySetting<OtpData>('password_reset_otp');
    if (!otpData) {
      return { success: false, message: 'لا يوجد طلب تغيير فعال، يرجى طلب رمز جديد' };
    }

    if (Date.now() > otpData.expiresAt) {
      await deleteSecuritySetting('password_reset_otp');
      return { success: false, message: 'انتهت صلاحية رمز التحقق (صالح لمدة 10 دقائق فقط)' };
    }

    if (otpData.attempts >= 5) {
      await deleteSecuritySetting('password_reset_otp');
      return { success: false, message: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد.' };
    }

    const isOtpValid = verifyPassword(otp.trim(), otpData.hash, otpData.salt);
    if (!isOtpValid) {
      otpData.attempts += 1;
      await saveSecuritySetting('password_reset_otp', otpData);
      return {
        success: false,
        message: `رمز التحقق غير صحيح. تبقى لك ${5 - otpData.attempts} محاولات.`,
      };
    }

    // الرمز صحيح! نقوم بتشفير وحفظ كلمة المرور الجديدة
    const { hash, salt } = hashPassword(newPassword);
    const passwordData: PasswordData = {
      hash,
      salt,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveSecuritySetting('admin_password', passwordData);
    if (!saved) {
      return {
        success: false,
        message: 'تعذر حفظ كلمة المرور في قاعدة البيانات. يرجى التأكد من تشغيل ملف supabase_admin_security.sql',
      };
    }

    // مسح الـ OTP المستهلك
    await deleteSecuritySetting('password_reset_otp');

    // إرسال تنبيه بالنجاح
    const adminEmail = await getAdminEmail();
    sendPasswordChangedNotification(adminEmail).catch(() => {});

    // تجديد جلسة الدخول بكلمة المرور الجديدة
    const token = await createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

    return {
      success: true,
      message: 'تم تغيير كلمة المرور وتأمين لوحة التحكم بنجاح!',
    };
  } catch (err: any) {
    console.error('Confirm password change error:', err);
    return { success: false, message: 'حدث خطأ أثناء تحديث كلمة المرور' };
  }
}

/**
 * معلومات حالة الأمان للوحة التحكم
 */
export async function getAdminSecurityStatus(): Promise<{
  isUsingCustomPassword: boolean;
  adminEmail: string;
  lastUpdated?: string;
}> {
  const stored = await getSecuritySetting<PasswordData>('admin_password');
  const email = await getAdminEmail();

  return {
    isUsingCustomPassword: !!stored,
    adminEmail: maskEmail(email),
    lastUpdated: stored?.updatedAt,
  };
}
