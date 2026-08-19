'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { flushMetaEvents, trackMetaEvent } from '../lib/metaPixel';

interface MetaPixelProps {
  pixelId?: string;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);
  const initialPath = useRef(pathname);
  const normalizedPixelId = pixelId?.trim();
  const isValidPixelId = Boolean(normalizedPixelId && /^\d+$/.test(normalizedPixelId));

  useEffect(() => {
    if (!isValidPixelId) return;

    const markAsReady = () => {
      if (!window.fbq) return false;
      lastTrackedPath.current = initialPath.current;
      flushMetaEvents();
      setIsReady(true);
      return true;
    };

    if (markAsReady()) return;

    const readinessInterval = window.setInterval(() => {
      if (markAsReady()) window.clearInterval(readinessInterval);
    }, 50);

    return () => window.clearInterval(readinessInterval);
  }, [isValidPixelId]);

  useEffect(() => {
    if (!isReady || lastTrackedPath.current === pathname) return;
    trackMetaEvent('PageView');
    lastTrackedPath.current = pathname;
  }, [isReady, pathname]);

  if (!isValidPixelId || !normalizedPixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${normalizedPixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${normalizedPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
