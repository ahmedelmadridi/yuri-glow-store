'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

// استبدل هذا الرقم برقم حساب إعلانات جوجل الخاص بك (Conversion ID)
// يبدأ عادة بـ AW-
const GOOGLE_ADS_ID = 'AW-YOUR_GOOGLE_ADS_ID_HERE';

export default function GoogleAdsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // تتبع مشاهدات الصفحة عند التنقل
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', GOOGLE_ADS_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* 
        نحن نعتمد هنا على أنك تستخدم بالفعل <GoogleAnalytics> في layout.tsx 
        وهو يقوم بتحميل مكتبة gtag.js الأساسية. 
        هنا نقوم فقط بتهيئة إعلانات جوجل وربطها.
      */}
      <Script
        id="google-ads-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('config', '${GOOGLE_ADS_ID}');
          `,
        }}
      />
    </>
  );
}
