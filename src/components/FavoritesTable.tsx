import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface FavoritesTableProps {
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
    logo: 'https://i.postimg.cc/KjzxPhbD/352321179-802641697768990-7499832421124251242-n.png'
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
  },
  {
    domain: 'startpeople.be',
    logo: 'https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc'
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

const FavoritesTable = ({ onTotalRecords, sortOrder, searchQuery, excludedWords = [] }: FavoritesTableProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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

  const filteredFavorites = favorites.filter(favorite => {
    const title = favorite.job_title?.toLowerCase() || '';
    const location = favorite.job_location?.toLowerCase() || '';
    const searchTerm = searchQuery?.toLowerCase() || '';
    
    const containsExcludedWord = excludedWords.some(word => 
      title.includes(word.toLowerCase()) || 
      location.includes(word.toLowerCase())
    );

    return (title.includes(searchTerm) || location.includes(searchTerm)) && !containsExcludedWord;
  }).sort((a, b) => {
    if (!sortOrder) return 0;
    const titleA = a.job_title?.toLowerCase() || '';
    const titleB = b.job_title?.toLowerCase() || '';
    return sortOrder === 'asc' 
      ? titleA.localeCompare(titleB)
      : titleB.localeCompare(titleA);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        Please log in to view your favorites.
      </div>
    );
  }

  if (!filteredFavorites.length) {
    return <div className="text-center py-8">No favorites found.</div>;
  }

  const renderMobileCard = (favorite: any) => (
    <Card key={favorite.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {favorite.job_link && (
              <img
                src={getLogoForUrl(favorite.job_link)}
                alt="Agency logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <h3 className="font-medium text-foreground">{favorite.job_title}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {favorite.job_location}
          </div>
          <div className="flex items-center justify-between">
            <a 
              href={favorite.job_link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir l'offre
              </Button>
            </a>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => removeFromFavorites.mutate(favorite.job_link)}
              className="text-red-500 hover:text-red-600"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
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
            <th className="p-6 text-left font-medium">LOCALISATION</th>
            <th className="p-6 text-left font-medium">LIEN</th>
            <th className="p-6 text-left font-medium">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredFavorites.map((favorite) => (
            <tr
              key={favorite.id}
              className="border-b border-border hover:bg-secondary/50 transition-colors"
            >
              <td className="p-6">
                {favorite.job_link && (
                  <img
                    src={getLogoForUrl(favorite.job_link)}
                    alt="Agency logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </td>
              <td className="p-6 font-medium text-foreground">{favorite.job_title}</td>
              <td className="p-6 text-muted-foreground">{favorite.job_location}</td>
              <td className="p-6">
                <a 
                  href={favorite.job_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir l'offre
                  </Button>
                </a>
              </td>
              <td className="p-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeFromFavorites.mutate(favorite.job_link)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div className="px-4">
          {filteredFavorites.map(favorite => renderMobileCard(favorite))}
        </div>
      ) : (
        renderDesktopTable()
      )}
    </>
  );
};

export default FavoritesTable;
