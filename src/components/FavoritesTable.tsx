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
          <h3 className="font-medium text-foreground">{favorite.job_title}</h3>
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