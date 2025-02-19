
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

export const parseDateString = (dateString: string | null): Date | null => {
  if (!dateString) return null;

  try {
    // Try ISO format first
    const isoDate = parseISO(dateString);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Try "dd/MM/yyyy" format
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date(), { locale: fr });
    if (!isNaN(parsedDate.getTime())) return parsedDate;

    // Try "dd-MM-yyyy" format
    const parsedDateDash = parse(dateString, 'dd-MM-yyyy', new Date(), { locale: fr });
    if (!isNaN(parsedDateDash.getTime())) return parsedDateDash;

    return null;
  } catch {
    return null;
  }
};

export const fetchJobResults = async (searchId: string | null, options?: { 
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc'
}) => {
  if (!searchId) {
    console.log('No searchId provided');
    return { data: [], count: 0 };
  }

  try {
    console.log('Fetching jobs with search_id:', searchId);
    
    // Detailed query logging
    const { data, error, count } = await supabase
      .from('job_results')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId)  // This matches the column name in Supabase
      .then(response => {
        if (response.error) {
          console.error('Supabase query error:', response.error);
        } else {
          console.log('Raw response:', response);
          console.log('Data count:', response.data?.length);
          console.log('First result:', response.data?.[0]);
        }
        return response;
      });

    if (error) {
      console.error('Error fetching job results:', error);
      throw error;
    }

    console.log('Found jobs:', data?.length || 0);

    let sortedData = data || [];

    if (options?.sortOrder) {
      switch (options.sortOrder) {
        case 'asc':
          sortedData = [...sortedData].sort((a, b) => 
            a.job_title.localeCompare(b.job_title)
          );
          break;
        case 'desc':
          sortedData = [...sortedData].sort((a, b) => 
            b.job_title.localeCompare(a.job_title)
          );
          break;
        case 'agency_asc':
        case 'agency_desc':
          sortedData = [...sortedData].sort((a, b) => {
            const domainA = new URL(a.job_link).hostname;
            const domainB = new URL(b.job_link).hostname;
            return options.sortOrder === 'agency_asc'
              ? domainA.localeCompare(domainB)
              : domainB.localeCompare(domainA);
          });
          break;
      }
    }

    return { data: sortedData, count: count || 0 };
  } catch (error) {
    console.error('Error in fetchJobResults:', error);
    throw error;
  }
};
