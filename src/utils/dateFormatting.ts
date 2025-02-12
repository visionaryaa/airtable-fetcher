
import { format, parseISO, subDays } from "date-fns";

export const formatPublicationDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    let date: Date;

    // Case 1: Already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Case 2: ISO format (2025-02-10T09:29:29Z)
    if (dateString.includes('T')) {
      date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy');
    }

    // Case 3: "il y a X jours"
    if (dateString.toLowerCase().includes('il y a')) {
      const daysMatch = dateString.match(/\d+/);
      if (daysMatch) {
        const daysAgo = parseInt(daysMatch[0]);
        date = subDays(new Date(), daysAgo);
        return format(date, 'dd/MM/yyyy');
      }
    }

    // Case 4: French date format (12 Décembre 2024)
    const frenchMonths = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };

    const frenchDateRegex = /(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})/i;
    const match = dateString.toLowerCase().match(frenchDateRegex);
    
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = frenchMonths[match[2] as keyof typeof frenchMonths];
      const year = match[3];
      return `${day}/${month}/${year}`;
    }

    // If none of the above formats match, try parsing as a regular date
    date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, 'dd/MM/yyyy');
    }

    // If we can't parse the date, return the original string
    console.warn('Unable to parse date:', dateString);
    return dateString;

  } catch (error) {
    console.error('Error formatting date:', error, 'for date string:', dateString);
    return dateString;
  }
};
