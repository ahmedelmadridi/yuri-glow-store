import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'من نحن | About Us - Yuri Glow',
  description: 'تعرف على قصة يوري جلو، وجهتك الأولى لمنتجات العناية بالبشرة الكورية الأصلية في مصر. Learn about Yuri Glow, your top destination for Korean skincare in Egypt.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
