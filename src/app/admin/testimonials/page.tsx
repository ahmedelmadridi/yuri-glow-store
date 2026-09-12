import { supabaseAdmin } from '@/lib/supabaseAdmin';
import TestimonialManager from './TestimonialManager';

export const revalidate = 0; // Disable caching

export default async function TestimonialsAdminPage() {
  const { data: testimonials } = await supabaseAdmin
    .from('screenshot_reviews')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>
        إدارة آراء العملاء (سكرين شوت)
      </h1>
      <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-light)' }}>
        يمكنك هنا رفع صور سكرين شوت لآراء العملاء من السوشيال ميديا لعرضها في الصفحة الرئيسية أسفل قسم الأكثر مبيعاً.
      </p>
      
      <TestimonialManager initialTestimonials={testimonials || []} />
    </div>
  );
}
