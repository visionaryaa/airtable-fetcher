import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import AirtableTable from "@/components/AirtableTable";
import SearchFilters, { SortOrder } from "@/components/jobs/SearchFilters";
import JobControls from "@/components/jobs/JobControls";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs', refreshKey, sortOrder, searchQuery, excludedWords],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' });

      if (sortOrder === 'asc') {
        query = query.order('job_title', { ascending: true });
      } else if (sortOrder === 'desc') {
        query = query.order('job_title', { ascending: false });
      } else if (sortOrder === 'agency_asc') {
        query = query.order('agency', { ascending: true });
      } else if (sortOrder === 'agency_desc') {
        query = query.order('agency', { ascending: false });
      }

      if (searchQuery) {
        query = query.ilike('job_title', `%${searchQuery}%`);
      }

      if (excludedWords.length > 0) {
        excludedWords.forEach(word => {
          query = query.not('job_title', 'ilike', `%${word}%`);
        });
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setTotalRecords(count || 0);
      return data;
    },
  });

  useEffect(() => {
    if (jobs && onTotalRecords) {
      onTotalRecords(jobs.length);
    }
  }, [jobs, onTotalRecords]);

  const handleScrape = async () => {
    setIsScrapingLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape');
      if (!response.ok) {
        throw new Error('Failed to trigger webhook');
      }
      toast({
        title: "Scraping en cours",
        description: "Les données sont en cours de mise à jour...",
      });
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du scraping.",
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeletingLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=delete');
      if (!response.ok) {
        throw new Error('Failed to trigger deletion');
      }
      toast({
        title: "Réinitialisation en cours",
        description: "La base de données est en cours de réinitialisation...",
      });
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation.",
      });
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    refetch();
  };

  const handleAddWord = (word: string) => {
    if (word && !excludedWords.includes(word)) {
      setExcludedWords([...excludedWords, word]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setExcludedWords(excludedWords.filter(word => word !== wordToRemove));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            {user && user.email && user.email.endsWith("@gmail.com") && (
              <Badge variant="secondary">
                Mode administrateur
              </Badge>
            )}
          </div>

          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            excludedWords={excludedWords}
            setExcludedWords={setExcludedWords}
            newWord={newWord}
            setNewWord={setNewWord}
          />

          <JobControls
            isScrapingLoading={isScrapingLoading}
            isDeletingLoading={isDeletingLoading}
            handleScrape={handleScrape}
            handleDelete={handleDelete}
            handleRefresh={handleRefresh}
          />

          <AirtableTable
            jobs={jobs || []}
            isLoading={isLoading}
            totalRecords={totalRecords}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
