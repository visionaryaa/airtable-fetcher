import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import SearchFilters from "@/components/jobs/SearchFilters";
import JobControls from "@/components/jobs/JobControls";
import AirtableTable from "@/components/AirtableTable";

const Favoris = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const periodicRefresh = () => {
    let count = 0;
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      count++;
      if (count >= 12) { // 12 times * 5 seconds = 60 seconds
        clearInterval(interval);
        setIsScrapingLoading(false);
        toast({
          title: "Mise à jour terminée",
          description: "La table a été mise à jour avec les nouvelles offres d'emploi.",
        });
      }
    }, 5000);
    return interval;
  };

  const handleScrape = async () => {
    setIsScrapingLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/275e2xl21itwarp2pskui1wp4fs6ohcs?action=scrape');
      if (!response.ok) throw new Error('Failed to trigger scraping');
      
      toast({
        title: "Recherche lancée",
        description: "La recherche d'offres d'emploi est en cours...",
      });
      
      const interval = periodicRefresh();
      return () => clearInterval(interval);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
      });
      setIsScrapingLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeletingLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/275e2xl21itwarp2pskui1wp4fs6ohcs?action=delete');
      if (!response.ok) throw new Error('Failed to trigger deletion');
      
      toast({
        title: "Suppression en cours",
        description: "Les données sont en cours de suppression...",
      });

      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        setIsDeletingLoading(false);
        toast({
          title: "Suppression terminée",
          description: "Toutes les données ont été supprimées.",
        });
      }, 7000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
      });
      setIsDeletingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <JobControls
            totalRecords={totalRecords}
            isScrapingLoading={isScrapingLoading}
            isDeletingLoading={isDeletingLoading}
            onScrape={handleScrape}
            onDelete={handleDelete}
          />

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

          <AirtableTable 
            onTotalRecords={setTotalRecords} 
            key={refreshKey} 
            sortOrder={sortOrder}
            searchQuery={searchQuery}
            excludedWords={excludedWords}
          />
        </div>
      </main>
    </div>
  );
};

export default Favoris;
