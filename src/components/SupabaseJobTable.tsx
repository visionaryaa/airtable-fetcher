
import React from 'react';
import { JobResult, fetchJobResults, parseDateString } from '@/services/supabaseJobs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Heart, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AGENCY_LOGOS = {
  'www.tempo-team.be': 'https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png',
  'www.proselect.be': 'https://i.postimg.cc/tg2Xq57M/IMG-7594.png',
  'www.adecco.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s',
  'www.asap.be': 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png',
  'www.synergie.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s',
  'www.randstad.be': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s',
  'www.accentjobs.be': 'https://i.postimg.cc/053yKcZg/IMG-7592.png',
  'www.startpeople.be': 'https://media.licdn.com/dms/image/D4E03AQHgFtkR3XiGeg/profile-displayphoto-shrink_800_800/0/1691396279584?e=2147483647&v=beta&t=c6kRhs0M6W04lWO8geW9A6KX_y3LJuOZ4xOl7oEYOh8',
  'www.agojobs.be': 'https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png',
  'be.sdworx.com': 'https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png',
  'www.roberthalf.be': 'https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg'
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Date non spécifiée';

  const date = parseDateString(dateString);
  if (!date) return 'Date invalide';

  try {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return 'Date invalide';
  }
};

const getLogoForUrl = (url: string): string | undefined => {
  try {
    const hostname = new URL(url).hostname;
    return AGENCY_LOGOS[hostname as keyof typeof AGENCY_LOGOS];
  } catch {
    return undefined;
  }
};

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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

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

  const handleAddToFavorites = async (job: JobResult) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter aux favoris",
      });
      return;
    }
    addToFavorites.mutate(job);
  };

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
    <div className="space-y-4">
      {isMobile ? (
        // Mobile view with cards
        <div className="space-y-4">
          {jobResults.data.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{job.job_title}</h3>
                    
                    {job.job_location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{job.job_location}</span>
                      </div>
                    )}
                    
                    {job.publication_date && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{formatDate(job.publication_date)}</span>
                      </div>
                    )}
                  </div>

                  {job.job_link && (
                    <img
                      src={getLogoForUrl(job.job_link)}
                      alt="Agency logo"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Voir l'offre
                  </a>

                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToFavorites(job)}
                      disabled={addToFavorites.isPending}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop view with table
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
                    <td className="py-3 px-4">
                      <div className="font-medium">{job.job_title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {job.job_location || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(job.publication_date)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {job.job_link && (
                        <img
                          src={getLogoForUrl(job.job_link)}
                          alt="Agency logo"
                          className="h-8 w-auto object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.svg';
                          }}
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Voir l'offre
                        </a>
                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToFavorites(job)}
                            disabled={addToFavorites.isPending}
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
      )}
    </div>
  );
};

export default SupabaseJobTable;
