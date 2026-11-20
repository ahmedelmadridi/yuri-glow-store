import { Metadata } from 'next';
import ReturnPolicyClient from './ReturnPolicyClient';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع والاستبدال | Return Policy - Yuri Glow',
  description: 'تعرف على سياسة الاسترجاع والاستبدال الخاصة بمتجر Yuri Glow لضمان حقوقك وتجربة تسوق آمنة.',
  alternates: {
    canonical: '/return-policy',
  },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
