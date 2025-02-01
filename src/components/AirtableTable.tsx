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

interface AirtableTableProps {
  onTotalRecords?: (total: number) => void;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  excludedWords?: string[];
}

const AGENCY_LOGOS = [
  {
    domain: 'proselect.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/424861504_903474951786484_6860552531033903105_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=9f87pSSpry0Q7kNvgFyrnoT&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ak1S7cV8uODElYBPLoC2BP7&oh=00_AYD11qaICw8KiEXJHPd2k0JeIOgaHaTW9IRlvZoyE62k0g&oe=67A1CC7A'
  },
  {
    domain: 'tempo-team.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/352321179_802641697768990_7499832421124251242_n.png?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=GoOS2AtHBusQ7kNvgHYxTXc&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ae_9EPVESkA8wMfDsEVP_6L&oh=00_AYCWUQSFWcAyItU6tzoRhWSwgmXvNMnk_iuILxmJsxa71Q&oe=67A19741'
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
    logo: 'https://scontent-bru2-1.xx.fbcdn.net/v/t39.30808-1/282401818_7471306532942250_8129507684428268966_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=V7V32kIB9kQQ7kNvgGrchjq&_nc_zt=24&_nc_ht=scontent-bru2-1.xx&_nc_gid=AxGzm78UeCGDdyODeeOkUVP&oh=00_AYCkOMbUGq7QW9APk_A0wqGGCWF4f3gkf8SaipnTsGtuZA&oe=67A1EB3A'
  }
];

const getLogoForUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
    const agencyInfo = AGENCY_LOGOS.find(agency => domain.includes(agency.domain));
    return agencyInfo?.logo;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

const AirtableTable = ({ onTotalRecords, sortOrder, searchQuery, excludedWords = [] }: AirtableTableProps) => {
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
    queryKey: ["airtable", currentOffset],
    queryFn: () => fetchAirtableRecords(currentOffset),
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
    const titleA = a.fields.Poste?.toLowerCase() || '';
    const titleB = b.fields.Poste?.toLowerCase() || '';
    return sortOrder === 'asc' 
      ? titleA.localeCompare(titleB)
      : titleB.localeCompare(titleA);
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
