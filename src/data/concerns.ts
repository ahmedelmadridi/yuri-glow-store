export interface SkinConcern {
  id: string;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  icon: string;
  accentColor: string;
  bgGradient: string;
  productIds: number[];
}

export const SKIN_CONCERNS: SkinConcern[] = [
  {
    id: 'acne-blackheads',
    title: 'الحبوب والرؤوس السوداء',
    title_en: 'Acne & Blackheads',
    subtitle: 'تنقية المسام، تجفيف البثور ومكافحة الرؤوس السوداء',
    subtitle_en: 'Purify pores, clear blemishes & target blackheads',
    icon: 'acne',
    accentColor: '#4A7C59',
    bgGradient: 'linear-gradient(135deg, #F0F7F2 0%, #E2EFE5 100%)',
    productIds: [18, 20, 27, 28, 29, 41, 42, 58, 61, 65, 69, 81, 9]
  },
  {
    id: 'pores-sebum',
    title: 'المسام الواسعة والدهون',
    title_en: 'Pores & Oil Control',
    subtitle: 'تضييق المسام، توازن الإفرازات الدهنية وتنعيم الملمس',
    subtitle_en: 'Tighten pores, control excess oil & refine skin texture',
    icon: 'pores',
    accentColor: '#3B7A8C',
    bgGradient: 'linear-gradient(135deg, #EFF6F8 0%, #DFEEF2 100%)',
    productIds: [10, 15, 16, 17, 18, 20, 22, 23, 27, 43, 47, 61, 69, 70, 72, 81]
  },
  {
    id: 'pigmentation',
    title: 'التصبغات وآثار الحبوب',
    title_en: 'Dark Spots & Pigmentation',
    subtitle: 'تفتيح البقع الداكنة، توحيد اللون واستعادة الإشراقة',
    subtitle_en: 'Fade dark spots, even skin tone & boost radiance',
    icon: 'sparkle',
    accentColor: '#C88D37',
    bgGradient: 'linear-gradient(135deg, #FAF4EB 0%, #F5E8D4 100%)',
    productIds: [1, 2, 15, 16, 17, 18, 21, 22, 23, 24, 25, 43, 48, 49, 53, 56, 68, 71, 72, 74]
  },
  {
    id: 'barrier-repair',
    title: 'الجفاف وترميم الحاجز',
    title_en: 'Dryness & Barrier Repair',
    subtitle: 'ترطيب عميق، تقوية حاجز البشرة وحمايتها من التلف',
    subtitle_en: 'Deep hydration, repair moisture barrier & lock in softness',
    icon: 'drop',
    accentColor: '#4A6FA5',
    bgGradient: 'linear-gradient(135deg, #F1F4FA 0%, #E3EAF6 100%)',
    productIds: [5, 6, 14, 19, 31, 35, 37, 39, 51, 52, 55, 57, 62, 63, 64, 70, 76, 77, 79, 80]
  },
  {
    id: 'soothing-redness',
    title: 'تهدئة البشرة الحساسة',
    title_en: 'Soothing & Redness Relief',
    subtitle: 'تسكين الالتهابات، تخفيف الاحمرار والعناية بالبشرة المتهيجة',
    subtitle_en: 'Calm irritation, relieve redness & soothe sensitive skin',
    icon: 'leaf',
    accentColor: '#7A8450',
    bgGradient: 'linear-gradient(135deg, #F4F6EE 0%, #E8EDE0 100%)',
    productIds: [5, 6, 9, 10, 34, 35, 37, 44, 54, 57, 64, 69, 77, 80]
  },
  {
    id: 'anti-aging',
    title: 'التجاعيد وشد البشرة',
    title_en: 'Anti-Aging & Firming',
    subtitle: 'تحفيز الكولاجين، تحسين المرونة وملء الخطوط الدقيقة',
    subtitle_en: 'Boost collagen, restore elasticity & smooth fine lines',
    icon: 'time',
    accentColor: '#88507E',
    bgGradient: 'linear-gradient(135deg, #F6F0F5 0%, #EDE1EC 100%)',
    productIds: [3, 4, 11, 13, 14, 30, 31, 32, 33, 36, 46, 50, 51, 52, 59, 60, 62, 66, 67, 75, 79]
  },
  {
    id: 'eye-care',
    title: 'الهالات ومحيط العين',
    title_en: 'Dark Circles & Eye Contour',
    subtitle: 'تفتيح الهالات، تخفيف الانتفاخات وشد محيط العين الحساس',
    subtitle_en: 'Brighten dark circles, reduce puffiness & firm eye area',
    icon: 'eye',
    accentColor: '#96616B',
    bgGradient: 'linear-gradient(135deg, #F7F1F2 0%, #EFE3E5 100%)',
    productIds: [1, 3, 33, 56, 60, 67]
  },
  {
    id: 'hair-care',
    title: 'العناية بالشعر وترميمه',
    title_en: 'Hair Care & Repair',
    subtitle: 'ترميم الشعر التالف، تقليل الهيشان وتحفيز الكثافة واللمعان',
    subtitle_en: 'Repair damaged hair, eliminate frizz & enhance shine',
    icon: 'hair',
    accentColor: '#9C6F44',
    bgGradient: 'linear-gradient(135deg, #F8F3EE 0%, #EFE5DB 100%)',
    productIds: [7, 8, 12, 40, 45, 73, 78]
  }
];

export function getAllConcerns(locale: 'ar' | 'en' = 'ar') {
  return SKIN_CONCERNS.map(c => ({
    ...c,
    displayName: locale === 'en' ? c.title_en : c.title,
    displaySubtitle: locale === 'en' ? c.subtitle_en : c.subtitle,
  }));
}

export function getConcernById(id: string, locale: 'ar' | 'en' = 'ar') {
  const concern = SKIN_CONCERNS.find(c => c.id === id);
  if (!concern) return null;
  return {
    ...concern,
    displayName: locale === 'en' ? concern.title_en : concern.title,
    displaySubtitle: locale === 'en' ? concern.subtitle_en : concern.subtitle,
  };
}

export function filterProductsByConcern<T extends { id: number }>(products: T[], concernId: string): T[] {
  const concern = SKIN_CONCERNS.find(c => c.id === concernId);
  if (!concern) return products;
  const idSet = new Set(concern.productIds);
  return products.filter(p => idSet.has(p.id));
}

export function getConcernsForProduct(productId: number, locale: 'ar' | 'en' = 'ar') {
  return SKIN_CONCERNS
    .filter(c => c.productIds.includes(productId))
    .map(c => ({
      id: c.id,
      name: locale === 'en' ? c.title_en : c.title,
      accentColor: c.accentColor,
    }));
}
