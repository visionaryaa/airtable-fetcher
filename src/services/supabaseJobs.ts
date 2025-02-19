
import { supabase } from "@/integrations/supabase/client";
import { parseISO, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface JobResult {
  id: string;
  job_title: string;
  job_link: string;
  job_location: string | null;
  publication_date: string | null;
  search_id: string;
  created_at: string | null;
}

const parseDateString = (dateString: string | null): Date | null => {
  if (!dateString) return null;

  try {
    // Handle "il y a X jours" format
    const daysAgoMatch = dateString.match(/il y a (\d+) jour/i);
    if (daysAgoMatch) {
      const daysAgo = parseInt(daysAgoMatch[1]);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    }

    // Handle "Aujourd'hui" and "Hier"
    if (dateString.toLowerCase().includes("aujourd'hui")) {
      return new Date();
    }
    if (dateString.toLowerCase().includes('hier')) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }

    // Handle ISO dates
    if (dateString.includes('T')) {
      return parseISO(dateString);
    }

    // Handle dd/mm/yyyy format
    const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
    const match = dateString.match(dateRegex);
    if (match) {
      const [_, day, month, year] = match;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }

    // Handle "1er mars 2024" format
    const frenchDateRegex = /(\d+)(er|e|ème)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i;
    const frenchMatch = dateString.match(frenchDateRegex);
    if (frenchMatch) {
      return parse(dateString, 'd MMMM yyyy', new Date(), { locale: fr });
    }

    // Handle Unix timestamps
    if (!isNaN(Number(dateString))) {
      const timestamp = Number(dateString);
      return new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp);
    }

    return null;
  } catch (error) {
    console.error('Error parsing date:', error, dateString);
    return null;
  }
};

export const fetchJobResults = async (searchId: string | null, options?: { 
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc' | 'date_asc' | 'date_desc' 
}) => {
  if (!searchId) return { data: [], count: 0 };

  try {
    let query = supabase
      .from('job_results')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId);

    // First get all results without sorting
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching job results:', error);
      throw error;
    }

    let sortedData = data ? [...data] : [];

    // Apply sorting
    if (options?.sortOrder && data) {
      switch (options.sortOrder) {
        case 'asc':
          sortedData.sort((a, b) => a.job_title.localeCompare(b.job_title));
          break;
        case 'desc':
          sortedData.sort((a, b) => b.job_title.localeCompare(a.job_title));
          break;
        case 'date_asc':
          sortedData.sort((a, b) => {
            const dateA = parseDateString(a.publication_date);
            const dateB = parseDateString(b.publication_date);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA.getTime() - dateB.getTime();
          });
          break;
        case 'date_desc':
          sortedData.sort((a, b) => {
            const dateA = parseDateString(a.publication_date);
            const dateB = parseDateString(b.publication_date);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
          });
          break;
        // Agency sorting is handled in memory since we need to parse the URLs
        case 'agency_asc':
        case 'agency_desc':
          sortedData.sort((a, b) => {
            const domainA = new URL(a.job_link).hostname;
            const domainB = new URL(b.job_link).hostname;
            return options.sortOrder === 'agency_asc'
              ? domainA.localeCompare(domainB)
              : domainB.localeCompare(domainA);
          });
          break;
      }
    }

    // Return a plain object without any non-serializable properties
    return {
      data: sortedData.map(job => ({
        id: job.id,
        job_title: job.job_title,
        job_link: job.job_link,
        job_location: job.job_location,
        publication_date: job.publication_date,
        search_id: job.search_id,
        created_at: job.created_at
      })),
      count: count || 0
    };
  } catch (error) {
    console.error('Error in fetchJobResults:', error);
    throw error;
  }
};
