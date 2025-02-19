
import React, { useState } from 'react';
import { JobResult, fetchJobResults } from '@/services/supabaseJobs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Loader2, Heart, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';

interface SupabaseJobTableProps {
  onTotalRecords?: (total: number) => void;
  searchId: string | null;
  searchQuery?: string;
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc';
  excludedWords?: string[];
}

const SupabaseJobTable: React.FC<SupabaseJobTableProps> = ({
  onTotalRecords,
  searchId,
  searchQuery = '',
  excludedWords = [],
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const isMobile = useIsMobile();

  const { data: jobResults, isLoading } = useQuery({
    queryKey: ['supabase-jobs', searchId, currentPage, pageSize],
    queryFn: async () => {
      console.log('Fetching jobs for searchId:', searchId);
      const results = await fetchJobResults(searchId, {
        offset: currentPage * pageSize,
        limit: pageSize,
      });
      console.log('Fetched results:', results);

      if (onTotalRecords && results.count !== null) {
        onTotalRecords(results.count);
      }

      return results;
    },
    enabled: !!searchId,
    refetchInterval: 5000,
  });

  const filteredResults = React.useMemo(() => {
    if (!jobResults?.data) {
      console.log('No job results data available');
      return [];
    }

    return jobResults.data.filter(job => {
      if (searchQuery && !job.job_title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (excludedWords.length > 0) {
        const jobTextLower = `${job.job_title} ${job.job_location || ''}`.toLowerCase();
        if (excludedWords.some(word => jobTextLower.includes(word.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [jobResults?.data, searchQuery, excludedWords]);

  const totalPages = jobResults?.count 
    ? Math.ceil(jobResults.count / pageSize) 
    : 0;

  if (!searchId) {
    console.log('No searchId provided');
    return null;
  }

  const renderMobileCard = (record: JobResult) => (
    <Card key={record.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">{record.job_title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {record.job_location || 'Non spécifié'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {record.publication_date
              ? format(new Date(record.publication_date), 'dd MMMM yyyy', { locale: fr })
              : 'Non spécifié'}
          </div>
          <div className="flex items-center justify-between">
            <a 
              href={record.job_link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Voir l'offre
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <div className="overflow-x-auto rounded-lg px-6">
      <table className="w-full border-collapse min-w-[800px] bg-background">
        <thead>
          <tr className="bg-secondary text-foreground">
            <th className="p-6 text-left font-medium">POSTE</th>
            <th className="p-6 text-left font-medium">LIEN</th>
            <th className="p-6 text-left font-medium">LOCALISATION</th>
            <th className="p-6 text-left font-medium">DATE DE PUBLICATION</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((job) => (
            <tr
              key={job.id}
              className="border-b border-border hover:bg-secondary/50 transition-colors"
            >
              <td className="p-6 font-medium text-foreground">{job.job_title}</td>
              <td className="p-6">
                <a 
                  href={job.job_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Voir l'offre
                  </Button>
                </a>
              </td>
              <td className="p-6 text-muted-foreground">{job.job_location || 'Non spécifié'}</td>
              <td className="p-6 text-muted-foreground">
                {job.publication_date
                  ? format(new Date(job.publication_date), 'dd MMMM yyyy', { locale: fr })
                  : 'Non spécifié'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading && !jobResults?.data?.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!filteredResults.length) {
    return <div className="text-center py-8">Aucun résultat trouvé.</div>;
  }

  return (
    <>
      {/* Job Count Display */}
      <div className="mb-6 px-4 md:px-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Offres d'emploi disponibles
            </h3>
            <p className="text-green-600 dark:text-green-300">
              {filteredResults.length} offre{filteredResults.length !== 1 ? 's' : ''} trouvée{filteredResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="px-4">
          {filteredResults.map(record => renderMobileCard(record))}
        </div>
      ) : (
        renderDesktopTable()
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Suivant
          </Button>
        </div>
      )}
    </>
  );
};

export default SupabaseJobTable;
