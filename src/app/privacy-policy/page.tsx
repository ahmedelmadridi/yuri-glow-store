import { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Privacy Policy - Yuri Glow',
  description: 'كيف نقوم بحماية بياناتك الشخصية في متجر Yuri Glow. How we protect your personal data at Yuri Glow.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
