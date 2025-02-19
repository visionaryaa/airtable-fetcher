import React from 'react';
import { JobResult, fetchJobResults, parseDateString, formatDate } from '@/services/supabaseJobs';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart, MapPin, Calendar, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const agencyLogos: { [key: string]: string } = {
  'proselect.be': 'https://i.postimg.cc/tg2Xq57M/IMG-7594.png',
  'tempo-team.be': 'https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png',
  'adecco.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s',
  'asap.be': 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png',
  'synergie.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s',
  'randstad.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s',
  'accentjobs.be': 'https://i.postimg.cc/053yKcZg/IMG-7592.png',
  'startpeople.be': 'https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc',
  'ago.jobs': 'https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png',
  'sdworx.be': 'https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png',
  'roberthalf.be': 'https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg'
};

const SupabaseJobTable: React.FC<SupabaseJobTableProps> = ({
  onTotalRecords,
  searchId,
  sortOrder = 'desc',
  searchQuery = '',
  excludedWords = [],
  baseKey = 'default'
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const addToFavorites = async (job: JobResult) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        job_title: job.job_title,
        job_link: job.job_link,
        job_location: job.job_location
      });

      if (error) throw error;

      toast({
        title: "Ajouté aux favoris",
        description: "L'offre a été ajoutée à vos favoris.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris.",
        variant: "destructive",
      });
    }
  };

  const { data: jobResults, isLoading } = useQuery({
    queryKey: ['supabase-jobs', searchId, sortOrder, baseKey],
    queryFn: async () => {
      console.log('Fetching jobs with searchId:', searchId);
      const results = await fetchJobResults(searchId, { sortOrder });
      console.log('Fetched results:', results);
      
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
    refetchInterval: 5000,
  });

  if (isLoading || !jobResults) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!jobResults?.data || jobResults.data.length === 0) {
    return <div className="text-center py-8">Aucun résultat trouvé.</div>;
  }

  const getAgencyLogo = (url: string) => {
    const hostname = new URL(url).hostname.replace('www.', '');
    return agencyLogos[hostname] || '/placeholder.svg';
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4 bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <span className="font-medium">{jobResults.data.length} résultat{jobResults.data.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        {jobResults.data.map((job) => (
          <div key={job.id} className="bg-card rounded-lg shadow-sm p-4 space-y-3 border">
            <div className="flex gap-4">
              <HoverCard>
                <HoverCardTrigger>
                  <img
                    src={getAgencyLogo(job.job_link)}
                    alt="Agency logo"
                    className="w-12 h-12 object-contain rounded-md"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/placeholder.svg';
                    }}
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  {new URL(job.job_link).hostname.replace('www.', '')}
                </HoverCardContent>
              </HoverCard>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-base">{job.job_title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{job.job_location || 'Non spécifié'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(parseDateString(job.publication_date))}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="default"
                size="sm"
                asChild
              >
                <a
                  href={job.job_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir l'offre
                </a>
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addToFavorites(job)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          <span className="font-medium">{jobResults.data.length} résultat{jobResults.data.length > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Agence</th>
                <th className="py-3 px-4 text-left font-medium">Poste</th>
                <th className="py-3 px-4 text-left font-medium">Localisation</th>
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobResults.data.map((job) => (
                <tr key={job.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 align-middle w-[100px]">
                    <HoverCard>
                      <HoverCardTrigger>
                        <img
                          src={getAgencyLogo(job.job_link)}
                          alt="Agency logo"
                          className="w-8 h-8 object-contain rounded-md"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.svg';
                          }}
                        />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        {new URL(job.job_link).hostname.replace('www.', '')}
                      </HoverCardContent>
                    </HoverCard>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <span className="font-medium">{job.job_title}</span>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{job.job_location || 'Non spécifié'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(parseDateString(job.publication_date))}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                      >
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir l'offre
                        </a>
                      </Button>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToFavorites(job)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupabaseJobTable;
