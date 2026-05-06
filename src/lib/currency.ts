// Auto-detect user's currency based on locale/timezone
const TIMEZONE_CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  'America/New_York': { code: 'USD', symbol: '$' },
  'America/Chicago': { code: 'USD', symbol: '$' },
  'America/Denver': { code: 'USD', symbol: '$' },
  'America/Los_Angeles': { code: 'USD', symbol: '$' },
  'Europe/London': { code: 'GBP', symbol: '£' },
  'Europe/Paris': { code: 'EUR', symbol: '€' },
  'Europe/Berlin': { code: 'EUR', symbol: '€' },
  'Europe/Madrid': { code: 'EUR', symbol: '€' },
  'Europe/Rome': { code: 'EUR', symbol: '€' },
  'Europe/Amsterdam': { code: 'EUR', symbol: '€' },
  'Europe/Brussels': { code: 'EUR', symbol: '€' },
  'Europe/Vienna': { code: 'EUR', symbol: '€' },
  'Europe/Dublin': { code: 'EUR', symbol: '€' },
  'Europe/Lisbon': { code: 'EUR', symbol: '€' },
  'Europe/Helsinki': { code: 'EUR', symbol: '€' },
  'Europe/Athens': { code: 'EUR', symbol: '€' },
  'Europe/Zurich': { code: 'CHF', symbol: 'CHF' },
  'Europe/Stockholm': { code: 'SEK', symbol: 'kr' },
  'Europe/Oslo': { code: 'NOK', symbol: 'kr' },
  'Europe/Copenhagen': { code: 'DKK', symbol: 'kr' },
  'Europe/Warsaw': { code: 'PLN', symbol: 'zł' },
  'Europe/Prague': { code: 'CZK', symbol: 'Kč' },
  'Europe/Budapest': { code: 'HUF', symbol: 'Ft' },
  'Europe/Bucharest': { code: 'RON', symbol: 'lei' },
  'Europe/Istanbul': { code: 'TRY', symbol: '₺' },
  'Europe/Moscow': { code: 'RUB', symbol: '₽' },
  'Asia/Tokyo': { code: 'JPY', symbol: '¥' },
  'Asia/Shanghai': { code: 'CNY', symbol: '¥' },
  'Asia/Hong_Kong': { code: 'HKD', symbol: 'HK$' },
  'Asia/Seoul': { code: 'KRW', symbol: '₩' },
  'Asia/Kolkata': { code: 'INR', symbol: '₹' },
  'Asia/Calcutta': { code: 'INR', symbol: '₹' },
  'Asia/Singapore': { code: 'SGD', symbol: 'S$' },
  'Asia/Kuala_Lumpur': { code: 'MYR', symbol: 'RM' },
  'Asia/Bangkok': { code: 'THB', symbol: '฿' },
  'Asia/Jakarta': { code: 'IDR', symbol: 'Rp' },
  'Asia/Manila': { code: 'PHP', symbol: '₱' },
  'Asia/Dubai': { code: 'AED', symbol: 'د.إ' },
  'Asia/Riyadh': { code: 'SAR', symbol: '﷼' },
  'Asia/Karachi': { code: 'PKR', symbol: '₨' },
  'Asia/Dhaka': { code: 'BDT', symbol: '৳' },
  'Asia/Colombo': { code: 'LKR', symbol: 'Rs' },
  'Africa/Lagos': { code: 'NGN', symbol: '₦' },
  'Africa/Nairobi': { code: 'KES', symbol: 'KSh' },
  'Africa/Johannesburg': { code: 'ZAR', symbol: 'R' },
  'Africa/Cairo': { code: 'EGP', symbol: 'E£' },
  'Africa/Casablanca': { code: 'MAD', symbol: 'MAD' },
  'Africa/Accra': { code: 'GHS', symbol: 'GH₵' },
  'America/Sao_Paulo': { code: 'BRL', symbol: 'R$' },
  'America/Argentina/Buenos_Aires': { code: 'ARS', symbol: 'AR$' },
  'America/Mexico_City': { code: 'MXN', symbol: 'MX$' },
  'America/Bogota': { code: 'COP', symbol: 'COL$' },
  'America/Santiago': { code: 'CLP', symbol: 'CL$' },
  'America/Lima': { code: 'PEN', symbol: 'S/.' },
  'America/Toronto': { code: 'CAD', symbol: 'CA$' },
  'America/Vancouver': { code: 'CAD', symbol: 'CA$' },
  'Australia/Sydney': { code: 'AUD', symbol: 'A$' },
  'Australia/Melbourne': { code: 'AUD', symbol: 'A$' },
  'Pacific/Auckland': { code: 'NZD', symbol: 'NZ$' },
  'Asia/Tel_Aviv': { code: 'ILS', symbol: '₪' },
};

let cachedCurrency: { code: string; symbol: string } | null = null;

export function getUserCurrency(): { code: string; symbol: string } {
  if (cachedCurrency) return cachedCurrency;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    cachedCurrency = TIMEZONE_CURRENCY_MAP[tz] || { code: 'USD', symbol: '$' };
  } catch {
    cachedCurrency = { code: 'USD', symbol: '$' };
  }

  return cachedCurrency;
}

export function formatCurrency(amount: number): string {
  const { code } = getUserCurrency();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    const { symbol } = getUserCurrency();
    return `${symbol}${amount.toLocaleString()}`;
  }
}
