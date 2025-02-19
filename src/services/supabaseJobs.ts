
import { supabase } from "@/integrations/supabase/client";

export interface JobResult {
  id: string;
  job_title: string;
  job_link: string;
  job_location: string | null;
  publication_date: string | null;
  search_id: string;
  created_at: string | null;
}

export const fetchJobResults = async (searchId: string | null, options?: { sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc' }) => {
  if (!searchId) return { data: [], count: 0 };

  try {
    let query = supabase
      .from('job_results')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId);

    if (options?.sortOrder) {
      switch (options.sortOrder) {
        case 'asc':
          query = query.order('job_title', { ascending: true });
          break;
        case 'desc':
          query = query.order('job_title', { ascending: false });
          break;
        // Agency sorting will be handled in memory since we need to parse the URLs
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching job results:', error);
      throw error;
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in fetchJobResults:', error);
    throw error;
  }
};
