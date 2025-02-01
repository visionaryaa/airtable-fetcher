import { useState, useEffect } from "react";
import AirtableTable from "@/components/AirtableTable";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <h1 className="text-xl font-semibold">JobScraper Pro</h1>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="hover:text-blue-400">Offres</a>
              <a href="#" className="hover:text-blue-400">Favoris</a>
              <button className="p-2 rounded-full hover:bg-gray-700">
                <Sun className="w-5 h-5" />
              </button>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Connexion
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Offres Logistiques Liège</h2>
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                {totalRecords} postes
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleScrape}
                disabled={isScrapingLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isScrapingLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  '+ Générer'
                )}
              </Button>

              <Button
                onClick={handleDelete}
                disabled={isDeletingLoading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Suppression en cours...
                  </>
                ) : (
                  'Supprimer'
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher un poste..."
                  className="w-full bg-[#2a2f3d] border-gray-700 focus:border-blue-500"
                />
              </div>
            </div>
            <Select
              value={sortOrder}
              onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
            >
              <SelectTrigger className="w-[200px] bg-[#2a2f3d] border-gray-700">
                <SelectValue placeholder="Trier par titre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-700 hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          <AirtableTable onTotalRecords={setTotalRecords} key={refreshKey} sortOrder={sortOrder} />
        </div>
      </main>
    </div>
  );
};

export default Index;
