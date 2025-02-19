import React, { useState } from 'react';
import { JobResult, fetchJobResults } from '@/services/supabaseJobs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Loader2, Heart, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';

const AGENCY_LOGOS = [
  {
    domain: 'proselect.be',
    logo: 'https://i.postimg.cc/tg2Xq57M/IMG-7594.png'
  },
  {
    domain: 'tempo-team.be',
    logo: 'https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png'
  },
  {
    domain: 'adecco.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s'
  },
  {
    domain: 'asap.be',
    logo: 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png'
  },
  {
    domain: 'synergiejobs.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s'
  },
  {
    domain: 'randstad.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s'
  },
  {
    domain: 'accentjobs.be',
    logo: 'https://i.postimg.cc/053yKcZg/IMG-7592.png'
  },
  {
    domain: 'startpeople.be',
    logo: 'https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc'
  },
  {
    domain: 'dajobs.be',
    logo: 'https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png'
  },
  {
    domain: 'sdworx.jobs',
    logo: 'https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png'
  },
  {
    domain: 'roberthalf.com',
    logo: 'https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg'
  },
  {
    domain: 'brightplus.be',
    logo: 'https://i.postimg.cc/8c6fdhKY/image.png'
  }
];

const getDomainFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
    
    if (hostname.includes('brightplus.be')) {
      return 'brightplus.be';
    }
    
    return hostname;
  } catch (error) {
    console.error('Error parsing URL:', error);
    if (url.toLowerCase().includes('brightplus.be')) {
      return 'brightplus.be';
    }
    return url;
  }
};

const getLogoForUrl = (url: string) => {
  try {
    const domain = getDomainFromUrl(url);
    const agencyInfo = AGENCY_LOGOS.find(agency => domain.includes(agency.domain));
    return agencyInfo?.logo;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

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
  sortOrder,
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

    let filtered = jobResults.data.filter(job => {
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

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOrder) {
          case 'asc':
            return a.job_title.localeCompare(b.job_title);
          case 'desc':
            return b.job_title.localeCompare(a.job_title);
          case 'agency_asc':
            return (a.job_link || '').localeCompare(b.job_link || '');
          case 'agency_desc':
            return (b.job_link || '').localeCompare(a.job_link || '');
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [jobResults?.data, searchQuery, excludedWords, sortOrder]);

  const totalPages = Math.ceil((jobResults?.count ?? 0) / pageSize);

  if (!searchId) {
    console.log('No searchId provided');
    return null;
  }

  const renderMobileCard = (record: JobResult) => (
    <Card key={record.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {record.job_link && (
              <img
                src={getLogoForUrl(record.job_link)}
                alt="Agency logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <h3 className="font-medium text-foreground">{record.job_title}</h3>
          </div>
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
            <th className="p-6 text-left font-medium">SOURCE</th>
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
              <td className="p-6">
                {job.job_link && (
                  <img
                    src={getLogoForUrl(job.job_link)}
                    alt="Agency logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </td>
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
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages}
          </span>
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
