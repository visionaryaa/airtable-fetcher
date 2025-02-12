
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchAirtableRecords } from "@/services/airtable";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { JobCard } from "./jobs/JobCard";
import { JobTableRow } from "./jobs/JobTableRow";

interface AirtableTableProps {
  onTotalRecords?: (total: number) => void;
  sortOrder?: 'asc' | 'desc' | 'agency_asc' | 'agency_desc';
  searchQuery?: string;
  excludedWords?: string[];
  baseKey?: 'logisticsLiege' | 'customSearch';
}

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
      const domainA = record.fields.lien ? new URL(record.fields.lien).hostname : '';
      const domainB = record.fields.lien ? new URL(record.fields.lien).hostname : '';
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

  if (isMobile) {
    return (
      <div className="px-4">
        {filteredRecords.map(record => (
          <JobCard
            key={record.id}
            record={record}
            isJobFavorited={isJobFavorited}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    );
  }

  return (
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
            <JobTableRow
              key={record.id}
              record={record}
              isJobFavorited={isJobFavorited}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AirtableTable;
