import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'تواصل مع فريق يوري جلو للاستفسار عن منتجات العناية بالبشرة الكورية وطلباتك.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
