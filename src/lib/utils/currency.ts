/**
 * Currency formatting utilities
 */

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  if (isNaN(amount)) return '0';
  
  // Ensure currency is valid
  const validCurrency = currency && ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'THB', 'SGD'].includes(currency) 
    ? currency 
    : 'VND';
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: validCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: validCurrency === 'VND' ? 0 : 2,
  });
  
  return formatter.format(amount);
}

export function formatNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function parseCurrency(amount: string | number): number {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    // Remove all non-numeric characters except decimal point
    const cleaned = amount.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'VND': '₫',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'KRW': '₩',
    'THB': '฿',
    'SGD': 'S$',
  };
  
  return symbols[currency] || currency;
}

export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
}
