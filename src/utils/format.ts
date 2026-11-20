export function formatPrice(amount: number | null | undefined, locale: 'ar' | 'en' = 'ar'): string {
  if (amount == null) return '';
  
  const roundedAmount = Math.round(amount);

  if (locale === 'en') {
    return `${roundedAmount.toLocaleString('en-US')} EGP`;
  }
  
  // Default Arabic formatting
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const amountStr = roundedAmount.toString().replace(/[0-9]/g, function (w) {
    return arabicNumerals[+w];
  });
  
  return `${amountStr} ج.م`;
}
