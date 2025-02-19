
import { supabase } from "@/integrations/supabase/client";

export interface JobResult {
  id: string;
  job_title: string;
  job_link: string;
  job_location: string | null;
  publication_date: string | null;
  search_id: string;
  created_at: string;
}

export const fetchJobResults = async (
  searchId: string | null,
  options: {
    offset?: number;
    limit?: number;
  } = {}
): Promise<{ data: JobResult[]; count: number | null }> => {
  if (!searchId) {
    console.log('No searchId provided to fetchJobResults');
    return { data: [], count: 0 };
  }

  try {
    console.log('Starting Supabase query with searchId:', searchId);
    
    let query = supabase
      .from('job_results')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId);

    // Add pagination if provided
    if (options.offset !== undefined && options.limit !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching job results:', error);
      throw error;
    }

    console.log('Successfully fetched data:', {
      resultCount: data?.length || 0,
      totalCount: count,
      firstResult: data?.[0],
    });

    return {
      data: data as JobResult[],
      count,
    };
  } catch (error) {
    console.error('Error in fetchJobResults:', error);
    throw error;
  }
};

export const clearJobResults = async (searchId: string) => {
  try {
    const { error } = await supabase
      .from('job_results')
      .delete()
      .eq('search_id', searchId);

    if (error) {
      console.error('Error clearing job results:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in clearJobResults:', error);
    throw error;
  }
};
