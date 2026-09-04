export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return '';
  
  // Round the amount to avoid long decimals, then convert standard digits to Arabic numerals
  const roundedAmount = Math.round(amount);
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const amountStr = roundedAmount.toString().replace(/[0-9]/g, function (w) {
    return arabicNumerals[+w];
  });
  
  return `${amountStr} ج.م`;
}
