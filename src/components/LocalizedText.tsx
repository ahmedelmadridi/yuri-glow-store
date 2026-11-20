"use client";

import { useLanguage } from '@/context/LanguageContext';

interface LocalizedTextProps {
  path: string;
  fallback?: string;
  params?: Record<string, string | number>;
}

export default function LocalizedText({ path, fallback, params }: LocalizedTextProps) {
  const { t } = useLanguage();
  return <>{t(path, params) || fallback || path}</>;
}
