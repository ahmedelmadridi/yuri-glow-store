-- إضافة أعمدة الترجمة باللغة الإنجليزية لجدول المنتجات
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS category_en TEXT,
ADD COLUMN IF NOT EXISTS features_en TEXT,
ADD COLUMN IF NOT EXISTS ingredients_en TEXT,
ADD COLUMN IF NOT EXISTS usage_instructions_en TEXT;
