/**
 * Converts a numerical amount into formal currency words.
 * Full native support for Bangladeshi Taka (BDT) with Taka and Poisha,
 * as well as USD, EUR, GBP, and INR.
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n] + ' ';
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ONES[n % 10] : '') + ' ';
  return ONES[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
}

function convertSouthAsianSystem(num: number): string {
  if (num === 0) return 'Zero';
  
  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  if (crore > 0) {
    result += convertSouthAsianSystem(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh).trim() + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand).trim() + ' Thousand ';
  }
  if (num > 0) {
    result += convertLessThanThousand(num).trim() + ' ';
  }
  
  return result.trim();
}

function convertInternationalSystem(num: number): string {
  if (num === 0) return 'Zero';
  
  const billions = Math.floor(num / 1000000000);
  num %= 1000000000;
  
  const millions = Math.floor(num / 1000000);
  num %= 1000000;
  
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  
  let result = '';
  if (billions > 0) {
    result += convertLessThanThousand(billions).trim() + ' Billion ';
  }
  if (millions > 0) {
    result += convertLessThanThousand(millions).trim() + ' Million ';
  }
  if (thousands > 0) {
    result += convertLessThanThousand(thousands).trim() + ' Thousand ';
  }
  if (num > 0) {
    result += convertLessThanThousand(num).trim() + ' ';
  }
  return result.trim();
}

export function amountToWords(
  amount: number,
  currencyCode: 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' = 'BDT'
): string {
  if (isNaN(amount) || amount === 0) {
    return currencyCode === 'BDT' ? 'Taka Zero Only' : `${currencyCode} Zero Only`;
  }

  const rounded = Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  const isSouthAsian = currencyCode === 'BDT' || currencyCode === 'INR';
  const mainWords = isSouthAsian
    ? convertSouthAsianSystem(integerPart)
    : convertInternationalSystem(integerPart);

  let currencyUnit = 'Taka';
  let subunit = 'Poisha';

  if (currencyCode === 'BDT') {
    currencyUnit = 'Taka';
    subunit = 'Poisha';
    let result = `${mainWords} ${currencyUnit}`;
    if (decimalPart > 0) {
      const decimalWords = convertLessThanThousand(decimalPart).trim();
      result += ` and ${decimalWords} ${subunit}`;
    }
    return `${result} Only`;
  } else if (currencyCode === 'USD') {
    currencyUnit = 'Dollars';
    subunit = 'Cents';
  } else if (currencyCode === 'EUR') {
    currencyUnit = 'Euros';
    subunit = 'Cents';
  } else if (currencyCode === 'GBP') {
    currencyUnit = 'Pounds';
    subunit = 'Pence';
  } else if (currencyCode === 'INR') {
    currencyUnit = 'Rupees';
    subunit = 'Paise';
  }

  let result = `${currencyCode} ${mainWords} ${currencyUnit}`;
  if (decimalPart > 0) {
    const decimalWords = convertLessThanThousand(decimalPart).trim();
    result += ` and ${decimalWords} ${subunit}`;
  }

  return `${result} Only`;
}
