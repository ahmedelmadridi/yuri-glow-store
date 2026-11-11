-- ========================================================
-- إحصائيات المتجر: تتبع المفضلة والكلمات الأكثر بحثاً
-- قم بتشغيل هذا الكود في Supabase SQL Editor لإنشاء الجداول
-- ========================================================

-- 1. جدول تسجيل أحداث المفضلة (Wishlist Events)
CREATE TABLE IF NOT EXISTS public.wishlist_events (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'add', -- 'add' أو 'remove'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- فهارس لتحسين سرعة الاستعلامات حسب التاريخ والمنتج
CREATE INDEX IF NOT EXISTS idx_wishlist_events_created_at ON public.wishlist_events(created_at);
CREATE INDEX IF NOT EXISTS idx_wishlist_events_product_id ON public.wishlist_events(product_id);

-- تفعيل أمان مستوى الصف (RLS)
ALTER TABLE public.wishlist_events ENABLE ROW LEVEL SECURITY;

-- 2. جدول تسجيل عمليات البحث (Search Logs)
CREATE TABLE IF NOT EXISTS public.search_logs (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- فهارس لتحسين سرعة الاستعلامات حسب التاريخ ومصطلح البحث
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON public.search_logs(query);

-- تفعيل أمان مستوى الصف (RLS)
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
