import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import AirtableTable from "@/components/AirtableTable";
import SearchFilters from "@/components/jobs/SearchFilters";
import JobControls from "@/components/jobs/JobControls";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const agencies = [
  { name: "Proselect", img: "https://i.postimg.cc/tg2Xq57M/IMG-7594.png" },
  { name: "Tempo-Team", img: "https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png" },
  { name: "Adecco", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s" },
  { name: "ASAP", img: "https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png" },
  { name: "Synergie", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s" },
  { name: "Randstad", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s" },
  { name: "Accent Jobs", img: "https://i.postimg.cc/053yKcZg/IMG-7592.png" },
  { name: "Start People", img: "https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc" },
  { name: "AGO Jobs", img: "https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png" },
  { name: "SD Worx", img: "https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png" },
  { name: "Robert Half", img: "https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg" }
];

type SortOrder = 'asc' | 'desc' | 'agency_asc' | 'agency_desc' | 'date_asc' | 'date_desc';

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

  const { data: userFilters } = useQuery({
    queryKey: ['user-filters', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_filters')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (userFilters?.excluded_words) {
      setExcludedWords(userFilters.excluded_words);
    }
  }, [userFilters]);

  const periodicRefresh = () => {
    let count = 0;
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      count++;
      if (count >= 6) {  // 6 times * 5 seconds = 30 seconds
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
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir le champ de recherche.",
      });
      return;
    }

    setIsScrapingLoading(true);
    setShowLoadingDialog(true);

    try {
      const response = await fetch(`https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape&search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to trigger scraping');
      
      // Wait for 10 seconds with the dialog open
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Close the dialog after 10 seconds
      setShowLoadingDialog(false);

      // Start periodic refresh after dialog closes
      const interval = periodicRefresh();
      return () => clearInterval(interval);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
      });
      setIsScrapingLoading(false);
      setShowLoadingDialog(false);
    }
  };

  const handleDelete = async () => {
    setIsDeletingLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=delete');
      if (!response.ok) throw new Error('Failed to trigger deletion');
      
      toast({
        title: "Réinitialisation en cours",
        description: "La base de données est en cours de réinitialisation...",
      });

      // First, wait for the deletion to complete (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Then trigger a refresh of the table by updating refreshKey
      setRefreshKey(prev => prev + 1);
      setIsDeletingLoading(false);
      
      toast({
        title: "Réinitialisation terminée",
        description: "La base de données a été réinitialisée avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation.",
      });
      setIsDeletingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#0A0F1E] to-[#1A1F2C] border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Recherche en cours</DialogTitle>
            <DialogDescription className="space-y-6">
              <p className="text-center text-gray-300 text-lg">
                Notre algorithme recherche pour vous toutes les offres d'emplois à pourvoir publiés sur les sites de toutes les grandes intérims wallonnes
              </p>
              
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-full max-w-xs mx-auto"
              >
                <CarouselContent>
                  {agencies.map((agency, index) => (
                    <CarouselItem key={index}>
                      <div className="p-2">
                        <div className="flex items-center justify-center h-24 bg-white/10 backdrop-blur-sm rounded-lg">
                          <img
                            src={agency.img}
                            alt={`${agency.name} logo`}
                            className="max-h-20 w-auto object-contain mix-blend-luminosity hover:mix-blend-normal transition-all duration-300"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <JobControls
            totalRecords={totalRecords}
            isScrapingLoading={isScrapingLoading}
            isDeletingLoading={isDeletingLoading}
            onScrape={handleScrape}
            onDelete={handleDelete}
          />

          <div className="space-y-4">
            {user && userFilters?.excluded_words.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {userFilters.excluded_words.length} filtre{userFilters.excluded_words.length > 1 ? 's' : ''} pré-appliqué{userFilters.excluded_words.length > 1 ? 's' : ''}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  depuis vos paramètres
                </span>
              </div>
            )}

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
          </div>

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

export default Index;
