
import React from 'react';
import { JobResult, fetchJobResults } from '@/services/supabaseJobs';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupabaseJobTableProps {
  onTotalRecords?: (total: number) => void;
  searchId?: string | null;
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc';
  searchQuery?: string;
  excludedWords?: string[];
}

const SupabaseJobTable: React.FC<SupabaseJobTableProps> = ({
  onTotalRecords,
  searchId,
  sortOrder = 'desc',
  searchQuery = '',
  excludedWords = [],
}) => {
  const { toast } = useToast();

  const { data: jobResults, isLoading } = useQuery({
    queryKey: ['supabase-jobs', searchId, sortOrder],
    queryFn: async () => {
      console.log('Fetching jobs for searchId:', searchId);
      const results = await fetchJobResults(searchId, { sortOrder });
      
      if (onTotalRecords) {
        onTotalRecords(results.count);
      }

      let filteredData = results.data.filter(job => {
        const title = job.job_title?.toLowerCase() || '';
        const location = job.job_location?.toLowerCase() || '';
        const searchTerm = searchQuery.toLowerCase();
        
        const matchesSearch = !searchQuery || 
          title.includes(searchTerm) || 
          location.includes(searchTerm);

        const noExcludedWords = !excludedWords.some(word => 
          title.includes(word.toLowerCase()) || 
          location.includes(word.toLowerCase())
        );

        return matchesSearch && noExcludedWords;
      });

      return { ...results, data: filteredData };
    },
    enabled: !!searchId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!jobResults?.data.length) {
    return <div className="text-center py-8">Aucun résultat trouvé.</div>;
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Poste</th>
              <th className="py-3 px-4 text-left font-medium">Localisation</th>
              <th className="py-3 px-4 text-left font-medium">Date</th>
              <th className="py-3 px-4 text-left font-medium">Agence</th>
              <th className="py-3 px-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobResults.data.map((job) => (
              <tr key={job.id} className="border-t">
                <td className="py-3 px-4">{job.job_title}</td>
                <td className="py-3 px-4">{job.job_location || 'Non spécifié'}</td>
                <td className="py-3 px-4">{job.publication_date || 'Non spécifié'}</td>
                <td className="py-3 px-4">
                  {new URL(job.job_link).hostname.replace('www.', '')}
                </td>
                <td className="py-3 px-4 text-center">
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Voir l'offre
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupabaseJobTable;
