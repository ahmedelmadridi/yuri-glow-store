'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const FB_PIXEL_ID = '1795208951817361';

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    
    // This tracks page views when the route changes
    // @ts-ignore
    window.fbq('track', 'PageView');
  }, [pathname, searchParams, loaded]);

  return (
    <div>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
          `,
        }}
      />
    </div>
  );
}
