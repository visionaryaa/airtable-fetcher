
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

interface FetchOptions {
  offset?: number;
  limit?: number;
}

export const fetchJobResults = async (searchId: string | null, options: FetchOptions = {}) => {
  if (!searchId) {
    return { data: [], count: 0 };
  }

  const { offset = 0, limit = 10 } = options;

  try {
    const query = supabase
      .from('job_results')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId)
      .range(offset, offset + limit - 1);

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
