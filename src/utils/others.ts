export function isValidURL(text: string): boolean {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  return urlPattern.test(text);
}

export const formatDate = (year, month, day) => {
  // Ensure month and day are always two digits
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  return `${year}-${formattedMonth}-${formattedDay}`;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function capitalizeWords(input: string): string {
  if (!input) return '';
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};

export function getCurrencySymbol(currency: string = 'usd'): string {
  const currencySymbols: Record<string, string> = {
    usd: '$', // Dólar estadounidense
    eur: '€', // Euro
    gbp: '£', // Libra esterlina
    jpy: '¥', // Yen japonés
    cad: 'C$', // Dólar canadiense
    aud: 'A$', // Dólar australiano
    chf: 'CHF', // Franco suizo
    cny: '¥', // Yuan chino
    sek: 'kr', // Corona sueca
    nzd: 'NZ$', // Dólar neozelandés
    mxn: 'MX$', // Peso mexicano
    brl: 'R$', // Real brasileño
    inr: '₹', // Rupia india
    krw: '₩', // Won surcoreano
  };

  return currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
}
