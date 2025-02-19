import React from 'react';
import { JobResult, fetchJobResults } from '@/services/supabaseJobs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Loader2, Heart, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AGENCY_LOGOS = [
  { domain: 'proselect.be', logo: 'https://i.postimg.cc/tg2Xq57M/IMG-7594.png' },
  { domain: 'tempo-team.be', logo: 'https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png' },
  { domain: 'adecco.be', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s' },
  { domain: 'asap.be', logo: 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png' },
  { domain: 'synergie', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s' },
  { domain: 'randstad.be', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s' },
  { domain: 'accentjobs.be', logo: 'https://i.postimg.cc/053yKcZg/IMG-7592.png' },
  { domain: 'startpeople.be', logo: 'https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc' },
  { domain: 'ago.jobs', logo: 'https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png' },
  { domain: 'sdworx.be', logo: 'https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png' },
  { domain: 'roberthalf.be', logo: 'https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg' }
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Non spécifié';
  
  try {
    const now = new Date();
    let date: Date | null = null;

    // Handle "il y a X jours" format
    const daysAgoMatch = dateString.match(/il y a (\d+) jour/i);
    if (daysAgoMatch) {
      const daysAgo = parseInt(daysAgoMatch[1]);
      if (daysAgo === 0) return "Aujourd'hui";
      if (daysAgo === 1) return "Hier";
      date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      return format(date, 'dd MMMM yyyy', { locale: fr });
    }

    // Handle "Aujourd'hui" and "Hier"
    if (dateString.toLowerCase().includes("aujourd'hui")) {
      return format(now, 'dd MMMM yyyy', { locale: fr });
    }
    if (dateString.toLowerCase().includes('hier')) {
      const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      return format(yesterday, 'dd MMMM yyyy', { locale: fr });
    }

    // Handle ISO dates (2024-12-11T10:00:00Z format)
    if (dateString.includes('T') && dateString.includes('Z')) {
      date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd MMMM yyyy', { locale: fr });
      }
    }

    // Handle dd/mm/yyyy format
    const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
    const match = dateString.match(dateRegex);
    if (match) {
      const [_, day, month, year] = match;
      const fullYear = year.length === 2 ? `20${year}` : year;
      date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd MMMM yyyy', { locale: fr });
      }
    }

    // Handle timestamp formats
    if (!isNaN(Number(dateString))) {
      const timestamp = Number(dateString);
      date = timestamp < 9999999999 
        ? new Date(timestamp * 1000) 
        : new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd MMMM yyyy', { locale: fr });
      }
    }

    // If we can't parse it, return the original string
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const getLogoForUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
    console.log('Checking domain:', domain);
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: jobResults, isLoading } = useQuery({
    queryKey: ['supabase-jobs', searchId, sortOrder],
    queryFn: async () => {
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

      if (sortOrder?.includes('agency')) {
        filteredData.sort((a, b) => {
          const domainA = new URL(a.job_link).hostname;
          const domainB = new URL(b.job_link).hostname;
          return sortOrder === 'agency_asc' 
            ? domainA.localeCompare(domainB)
            : domainB.localeCompare(domainA);
        });
      }

      return { ...results, data: filteredData };
    },
    enabled: !!searchId,
    refetchInterval: 5000,
  });

  const addToFavorites = useMutation({
    mutationFn: async (job: JobResult) => {
      if (!user) throw new Error('Must be logged in to add favorites');
      
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          job_title: job.job_title,
          job_link: job.job_link,
          job_location: job.job_location
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Succès",
        description: "Offre ajoutée aux favoris",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter aux favoris",
        });
      }
    }
  });

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
            {formatDate(record.publication_date)}
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
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => addToFavorites.mutate(record)}
                className="text-gray-500 hover:text-red-500"
              >
                <Heart className="w-5 h-5" />
              </Button>
            )}
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
            {user && <th className="p-6 text-left font-medium">ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {jobResults?.data.map((job) => (
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
              <td className="p-6 text-muted-foreground">{formatDate(job.publication_date)}</td>
              {user && (
                <td className="p-6">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => addToFavorites.mutate(job)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading || !jobResults) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!jobResults.data.length) {
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
              {jobResults.count} offre{jobResults.count !== 1 ? 's' : ''} trouvée{jobResults.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="px-4">
          {jobResults.data.map(record => renderMobileCard(record))}
        </div>
      ) : (
        renderDesktopTable()
      )}
    </>
  );
};

export default SupabaseJobTable;
