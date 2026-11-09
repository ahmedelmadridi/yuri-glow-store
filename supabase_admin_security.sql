-- إنشاء جدول الأمان وحفظ كلمة المرور المشفرة ورموز التحقق
-- يُنفذ هذا الكود في Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.admin_security (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- تفعيل سياسة أمان مستوى الصف (Row Level Security)
ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;

-- تنبيه: لا ننشئ أي Policy لـ public أو anon!
-- الجدول مغلق تماماً عن أي وصول عبر الواجهة الأمامية أو مفتاح anon_key.
-- الوصول إليه متاح حصرياً لسيرفر Next.js باستخدام SUPABASE_SERVICE_ROLE_KEY.
