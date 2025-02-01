import { useState, useEffect } from "react";
import AirtableTable from "@/components/AirtableTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Function to handle periodic refresh
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
      
      // Start periodic refresh
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

      // Wait for 7 seconds before refreshing
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Offres d'emploi en logistique à Liège</h1>
          <p className="text-gray-600">Total des offres trouvées: {totalRecords}</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleScrape}
            disabled={isScrapingLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isScrapingLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Recherche en cours...
              </>
            ) : (
              'Rechercher'
            )}
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isDeletingLoading}
            variant="destructive"
          >
            {isDeletingLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Suppression en cours...
              </>
            ) : (
              'Supprimer tout'
            )}
          </Button>
        </div>

        <AirtableTable onTotalRecords={setTotalRecords} key={refreshKey} />
      </div>
    </div>
  );
};

export default Index;