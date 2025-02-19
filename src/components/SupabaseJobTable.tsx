
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResult, fetchJobResults } from '@/services/supabaseJobs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

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

  const { data: jobResults, isLoading } = useQuery({
    queryKey: ['supabase-jobs', searchId, currentPage],
    queryFn: async () => {
      const results = await fetchJobResults(searchId, {
        offset: currentPage * pageSize,
        limit: pageSize,
      });

      if (onTotalRecords && results.count !== null) {
        onTotalRecords(results.count);
      }

      return results;
    },
    enabled: !!searchId,
  });

  const filteredResults = React.useMemo(() => {
    if (!jobResults?.data) return [];

    return jobResults.data.filter(job => {
      // Filter by search query
      if (searchQuery && !job.poste.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter out jobs with excluded words
      if (excludedWords.length > 0) {
        const jobTextLower = `${job.poste} ${job.localisation || ''}`.toLowerCase();
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
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Poste</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Date de publication</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Aucun résultat trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.poste}</TableCell>
                  <TableCell>{job.localisation || 'Non spécifié'}</TableCell>
                  <TableCell>
                    {job.publication_date
                      ? format(new Date(job.publication_date), 'dd MMMM yyyy', { locale: fr })
                      : 'Non spécifié'}
                  </TableCell>
                  <TableCell>
                    <a
                      href={job.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Voir l'offre
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
};

export default SupabaseJobTable;
