import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchAirtableRecords } from "@/services/airtable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface AirtableTableProps {
  onTotalRecords?: (total: number) => void;
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc';
  searchQuery?: string;
  excludedWords?: string[];
  baseKey?: 'logisticsLiege' | 'customSearch';
}

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
  }
];

const getDomainFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
  } catch (error) {
    console.error('Error parsing URL:', error);
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    let date;
    if (dateString.includes('T')) {
      date = parseISO(dateString);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    return format(date, "d MMMM yyyy", { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error, 'for date string:', dateString);
    return '';
  }
};

const AirtableTable = ({ 
  onTotalRecords, 
  sortOrder, 
  searchQuery, 
  excludedWords = [],
  baseKey = 'logisticsLiege'
}: AirtableTableProps) => {
  const [currentOffset, setCurrentOffset] = useState<string | undefined>();
  const [previousOffsets, setPreviousOffsets] = useState<string[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToFavorites = useMutation({
    mutationFn: async (job: { title: string; location: string; link: string }) => {
      if (!user) throw new Error('Must be logged in to add favorites');
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          job_title: job.title,
          job_location: job.location,
          job_link: job.link,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Success",
        description: "Job added to favorites",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add job to favorites",
        });
      }
    }
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (jobLink: string) => {
      if (!user) throw new Error('Must be logged in to remove favorites');
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('job_link', jobLink)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Success",
        description: "Job removed from favorites",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove job from favorites",
        });
      }
    }
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["airtable", currentOffset, baseKey],
    queryFn: () => fetchAirtableRecords(currentOffset, baseKey),
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data from Airtable",
        });
      }
    }
  });

  useEffect(() => {
    if (data?.records) {
      if (currentOffset) {
        setAllRecords(prev => [...prev, ...data.records]);
      } else {
        setAllRecords(data.records);
      }

      if (data.offset) {
        setPreviousOffsets(prev => [...prev, currentOffset || ""]);
        setCurrentOffset(data.offset);
      }
    }
  }, [data]);

  useEffect(() => {
    if (onTotalRecords) {
      onTotalRecords(filteredRecords.length);
    }
  }, [allRecords.length, onTotalRecords, searchQuery, excludedWords]);

  const filteredRecords = allRecords.filter(record => {
    const poste = record.fields.Poste?.toLowerCase() || '';
    const location = record.fields.Localisation?.toLowerCase() || '';
    const searchTerm = searchQuery?.toLowerCase() || '';
    
    const containsExcludedWord = excludedWords.some(word => 
      poste.includes(word.toLowerCase()) || 
      location.includes(word.toLowerCase())
    );

    return (poste.includes(searchTerm) || location.includes(searchTerm)) && !containsExcludedWord;
  }).sort((a, b) => {
    if (!sortOrder) return 0;
    
    if (sortOrder === 'agency_asc' || sortOrder === 'agency_desc') {
      const domainA = getDomainFromUrl(a.fields.lien || '');
      const domainB = getDomainFromUrl(b.fields.lien || '');
      return sortOrder === 'agency_asc' 
        ? domainA.localeCompare(domainB)
        : domainB.localeCompare(domainA);
    }
    
    const posteA = a.fields.Poste || '';
    const posteB = b.fields.Poste || '';
    return sortOrder === 'asc' 
      ? posteA.localeCompare(posteB)
      : posteB.localeCompare(posteA);
  });

  const isJobFavorited = (jobLink: string) => {
    return favorites.some(fav => fav.job_link === jobLink);
  };

  const handleFavoriteToggle = (record: any) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to save favorites",
      });
      return;
    }

    const jobLink = record.fields.lien;
    if (isJobFavorited(jobLink)) {
      removeFromFavorites.mutate(jobLink);
    } else {
      addToFavorites.mutate({
        title: record.fields.Poste,
        location: record.fields.Localisation,
        link: jobLink,
      });
    }
  };

  const renderMobileCard = (record: any) => (
    <Card key={record.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {record.fields.lien && (
              <img
                src={getLogoForUrl(record.fields.lien)}
                alt="Agency logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <h3 className="font-medium text-foreground">{record.fields.Poste}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {record.fields.Localisation}
          </div>
          {record.fields["Publication date"] && (
            <div className="text-sm text-muted-foreground">
              Publié le {formatDate(record.fields["Publication date"])}
            </div>
          )}
          <div className="flex items-center justify-between">
            <a 
              href={record.fields.lien} 
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
            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:text-red-500 ${isJobFavorited(record.fields.lien) ? 'text-red-500' : ''}`}
              onClick={() => handleFavoriteToggle(record)}
            >
              <Heart className="w-5 h-5" fill={isJobFavorited(record.fields.lien) ? "currentColor" : "none"} />
            </Button>
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
            <th className="p-6 text-left font-medium">FAVORIS</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr
              key={record.id}
              className="border-b border-border hover:bg-secondary/50 transition-colors"
            >
              <td className="p-6">
                {record.fields.lien && (
                  <img
                    src={getLogoForUrl(record.fields.lien)}
                    alt="Agency logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </td>
              <td className="p-6 font-medium text-foreground">{record.fields.Poste}</td>
              <td className="p-6">
                <a 
                  href={record.fields.lien} 
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
              <td className="p-6 text-muted-foreground">{record.fields.Localisation}</td>
              <td className="p-6 text-muted-foreground">
                {formatDate(record.fields["Publication date"])}
              </td>
              <td className="p-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`hover:text-red-500 ${isJobFavorited(record.fields.lien) ? 'text-red-500' : ''}`}
                  onClick={() => handleFavoriteToggle(record)}
                >
                  <Heart className="w-5 h-5" fill={isJobFavorited(record.fields.lien) ? "currentColor" : "none"} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading && !allRecords.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load data. Please try again later.
      </div>
    );
  }

  if (!filteredRecords.length) {
    return <div className="text-center py-8">No records found.</div>;
  }

  return (
    <>
      {isMobile ? (
        <div className="px-4">
          {filteredRecords.map(record => renderMobileCard(record))}
        </div>
      ) : (
        renderDesktopTable()
      )}
    </>
  );
};

export default AirtableTable;
