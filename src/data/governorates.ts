export interface Governorate {
  name: string;
  nameEn?: string;
  shippingCost: number;
}

export const governorateMap: Record<string, string> = {
  'القاهرة': 'Cairo',
  'الجيزة': 'Giza',
  'السويس': 'Suez',
  'بورسعيد': 'Port Said',
  'الإسماعيلية': 'Ismailia',
  'الإسكندرية': 'Alexandria',
  'البحيرة': 'Beheira',
  'كفر الشيخ': 'Kafr El Sheikh',
  'الدقهلية': 'Dakahlia',
  'دمياط': 'Damietta',
  'الغربية': 'Gharbia',
  'المنوفية': 'Monufia',
  'الشرقية': 'Sharqia',
  'القليوبية': 'Qalyubia',
  'بني سويف': 'Beni Suef',
  'الفيوم': 'Fayoum',
  'المنيا': 'Minya',
  'أسيوط': 'Asyut',
  'سوهاج': 'Sohag',
  'قنا': 'Qena',
  'الأقصر': 'Luxor',
  'أسوان': 'Aswan',
  'مطروح': 'Matrouh',
  'الوادي الجديد': 'New Valley',
  'شمال سيناء': 'North Sinai',
  'جنوب سيناء': 'South Sinai',
  'البحر الأحمر': 'Red Sea',
};

export const governorates: Governorate[] = [
  // 80 EGP
  { name: 'القاهرة', nameEn: 'Cairo', shippingCost: 80 },
  { name: 'الجيزة', nameEn: 'Giza', shippingCost: 80 },
  { name: 'السويس', nameEn: 'Suez', shippingCost: 80 },
  { name: 'بورسعيد', nameEn: 'Port Said', shippingCost: 80 },
  { name: 'الإسماعيلية', nameEn: 'Ismailia', shippingCost: 80 },

  // 90 EGP
  { name: 'الإسكندرية', nameEn: 'Alexandria', shippingCost: 90 },
  { name: 'البحيرة', nameEn: 'Beheira', shippingCost: 90 },
  { name: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', shippingCost: 90 },
  { name: 'الدقهلية', nameEn: 'Dakahlia', shippingCost: 90 },
  { name: 'دمياط', nameEn: 'Damietta', shippingCost: 90 },
  { name: 'الغربية', nameEn: 'Gharbia', shippingCost: 90 },
  { name: 'المنوفية', nameEn: 'Monufia', shippingCost: 90 },
  { name: 'الشرقية', nameEn: 'Sharqia', shippingCost: 90 },
  { name: 'القليوبية', nameEn: 'Qalyubia', shippingCost: 90 },

  // 100 EGP
  { name: 'بني سويف', nameEn: 'Beni Suef', shippingCost: 100 },
  { name: 'الفيوم', nameEn: 'Fayoum', shippingCost: 100 },
  { name: 'المنيا', nameEn: 'Minya', shippingCost: 100 },
  { name: 'أسيوط', nameEn: 'Asyut', shippingCost: 100 },
  { name: 'سوهاج', nameEn: 'Sohag', shippingCost: 100 },
  { name: 'قنا', nameEn: 'Qena', shippingCost: 100 },
  { name: 'الأقصر', nameEn: 'Luxor', shippingCost: 100 },
  { name: 'أسوان', nameEn: 'Aswan', shippingCost: 100 },

  // 160 EGP
  { name: 'مطروح', nameEn: 'Matrouh', shippingCost: 160 },
  { name: 'الوادي الجديد', nameEn: 'New Valley', shippingCost: 160 },
  { name: 'شمال سيناء', nameEn: 'North Sinai', shippingCost: 160 },
  { name: 'جنوب سيناء', nameEn: 'South Sinai', shippingCost: 160 },
  { name: 'البحر الأحمر', nameEn: 'Red Sea', shippingCost: 160 },
];
