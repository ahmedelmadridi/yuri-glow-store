export const TIKTOK_PIXEL_ID = 'DBOT47JC77UASCMHBC3G';

export const trackTikTokEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(name, options);
  }
};
