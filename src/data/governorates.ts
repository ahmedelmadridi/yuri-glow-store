export interface Governorate {
  name: string;
  shippingCost: number;
}

export const governorates: Governorate[] = [
  // 80 EGP
  { name: 'القاهرة', shippingCost: 80 },
  { name: 'الجيزة', shippingCost: 80 },
  { name: 'السويس', shippingCost: 80 },
  { name: 'بورسعيد', shippingCost: 80 },
  { name: 'الإسماعيلية', shippingCost: 80 },

  // 90 EGP
  { name: 'الإسكندرية', shippingCost: 90 },
  { name: 'البحيرة', shippingCost: 90 },
  { name: 'كفر الشيخ', shippingCost: 90 },
  { name: 'الدقهلية', shippingCost: 90 },
  { name: 'دمياط', shippingCost: 90 },
  { name: 'الغربية', shippingCost: 90 },
  { name: 'المنوفية', shippingCost: 90 },
  { name: 'الشرقية', shippingCost: 90 },
  { name: 'القليوبية', shippingCost: 90 },

  // 100 EGP
  { name: 'بني سويف', shippingCost: 100 },
  { name: 'الفيوم', shippingCost: 100 },
  { name: 'المنيا', shippingCost: 100 },
  { name: 'أسيوط', shippingCost: 100 },
  { name: 'سوهاج', shippingCost: 100 },
  { name: 'قنا', shippingCost: 100 },
  { name: 'الأقصر', shippingCost: 100 },
  { name: 'أسوان', shippingCost: 100 },

  // 160 EGP
  { name: 'مطروح', shippingCost: 160 },
  { name: 'الوادي الجديد', shippingCost: 160 },
  { name: 'شمال سيناء', shippingCost: 160 },
  { name: 'جنوب سيناء', shippingCost: 160 },
  { name: 'البحر الأحمر', shippingCost: 160 },
];
