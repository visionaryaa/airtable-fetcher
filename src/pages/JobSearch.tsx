import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search, MapPin, Radio, Loader2, ChevronDown } from "lucide-react";
import SearchFilters from "@/components/jobs/SearchFilters";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Autoplay from "embla-carousel-autoplay";
import SupabaseJobTable from "@/components/SupabaseJobTable";

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

const formSchema = z.object({
  nom_du_job: z.string().min(1, "Le nom du job est requis"),
  code_postale: z.string().length(4, "Le code postal doit contenir 4 chiffres").regex(/^\d+$/, "Le code postal doit contenir uniquement des chiffres"),
  rayon: z.string(),
});

const JobSearch = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'agency_asc' | 'agency_desc'>();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    const savedSearchId = localStorage.getItem('currentSearchId');
    if (savedSearchId) {
      const searchTimestamp = parseInt(savedSearchId.replace('search_', ''));
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (searchTimestamp < oneHourAgo) {
        localStorage.removeItem('currentSearchId');
        setCurrentSearchId(null);
      } else {
        setCurrentSearchId(savedSearchId);
      }
    } else {
      setCurrentSearchId(null);
    }
  }, []);

  const periodicRefresh = () => {
    let count = 0;
    const interval = setInterval(() => {
      if (currentSearchId) {
        queryClient.invalidateQueries({ queryKey: ['airtable', currentSearchId] });
      }
      count++;
      if (count >= 18) {  // 18 times * 5 seconds = 90 seconds
        clearInterval(interval);
        setIsSubmitting(false);
        setShowLoadingDialog(false);
        toast({
          title: "Mise à jour terminée",
          description: "La recherche est terminée.",
        });
      }
    }, 5000);
    return interval;
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

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (currentSearchId) {
        await queryClient.invalidateQueries({ queryKey: ['airtable', currentSearchId] });
      }
      
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
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_du_job: "",
      code_postale: "",
      rayon: "25",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setShowLoadingDialog(true);
    
    try {
      localStorage.removeItem('currentSearchId');
      
      const searchId = 'search_' + Date.now();
      setCurrentSearchId(searchId);
      
      localStorage.setItem('currentSearchId', searchId);
      
      const response = await fetch(
        `https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape&nom_du_job=${encodeURIComponent(values.nom_du_job)}&code_postale=${encodeURIComponent(values.code_postale)}&rayon=${encodeURIComponent(values.rayon)}&searchId=${encodeURIComponent(searchId)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
      
      setShowLoadingDialog(false);

      await queryClient.invalidateQueries({ queryKey: ['airtable', searchId] });

      const interval = periodicRefresh();
      return () => clearInterval(interval);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
      });
      setIsSubmitting(false);
      setShowLoadingDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                  align: "start",
                  loop: true,
                  slidesToScroll: 1,
                  containScroll: false,
                }}
                plugins={[
                  Autoplay({
                    delay: 2000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: false,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-1">
                  {agencies.map((agency, index) => (
                    <CarouselItem key={index} className="pl-1 basis-1/3">
                      <div className="p-1">
                        <div className="flex items-center justify-center h-16 bg-white/10 backdrop-blur-sm rounded-lg">
                          <img
                            src={agency.img}
                            alt={`${agency.name} logo`}
                            className="max-h-12 w-auto object-contain mix-blend-luminosity hover:mix-blend-normal transition-all duration-300"
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
        <div className="max-w-5xl mx-auto space-y-6 mb-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Recherche personnalisée</h1>
            <p className="text-muted-foreground">
              Trouvez le job qui vous correspond en quelques clics
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 md:space-y-0 bg-card p-6 rounded-lg shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="nom_du_job"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Quel job recherchez-vous?" 
                            className="pl-9" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code_postale"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Code postal"
                            className="pl-9"
                            maxLength={4}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length <= 4) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rayon"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Radio className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <SelectTrigger className="pl-9">
                              <SelectValue placeholder="Rayon" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5km</SelectItem>
                          <SelectItem value="25">25km</SelectItem>
                          <SelectItem value="40">40km</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 md:col-span-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Rechercher
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeletingLoading}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réinitialisation...
                      </>
                    ) : (
                      'Réinitialiser'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
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

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between items-center">
                <span>Filtrer les résultats</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
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
            </CollapsibleContent>
          </Collapsible>

          {currentSearchId ? (
            <SupabaseJobTable 
              onTotalRecords={setTotalRecords} 
              sortOrder={sortOrder}
              searchQuery={searchQuery}
              excludedWords={excludedWords}
              baseKey="customSearch"
              searchId={currentSearchId}
            />
          ) : (
            <div className="text-center text-muted-foreground mt-8">
              Utilisez le formulaire ci-dessus pour rechercher des offres d'emploi
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
