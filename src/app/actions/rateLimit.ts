'use server'

import { headers } from 'next/headers';

// تخزين مؤقت في ذاكرة الخادم لتتبع الطلبات
// خريطة: عنوان IP -> مصفوفة بأوقات الطلبات
const rateLimitStore = new Map<string, number[]>();

export async function checkRateLimit(): Promise<{ success: boolean; message?: string }> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    // استخراج عنوان الـ IP (سواء كان محلياً أو على خوادم Vercel)
    const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
    
    if (ip === 'unknown') return { success: true }; // السماح بالمرور في حالة عدم التمكن من قراءة الـ IP

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // الإطار الزمني: ساعة واحدة (بالمللي ثانية)
    const maxRequests = 3; // أقصى عدد مسموح به من الطلبات

    // تنظيف السجل من الطلبات القديمة (أقدم من ساعة) لهذا الـ IP
    let requestTimestamps = rateLimitStore.get(ip) || [];
    requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < windowMs);

    // التحقق مما إذا كان قد تجاوز الحد
    if (requestTimestamps.length >= maxRequests) {
      return { 
        success: false, 
        message: 'لقد تجاوزت الحد المسموح به من الطلبات (3 طلبات). يرجى المحاولة مرة أخرى بعد ساعة لتجنب الحظر.' 
      };
    }

    // تسجيل الطلب الجديد
    requestTimestamps.push(now);
    rateLimitStore.set(ip, requestTimestamps);

    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    // في حالة حدوث خطأ داخلي، نسمح بالمرور لعدم تعطيل المشترين الحقيقيين
    return { success: true }; 
  }
}
