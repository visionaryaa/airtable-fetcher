import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { Search, MapPin, Radio, Loader2, ChevronDown, Box } from "lucide-react";
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
  { name: "Robert Half", img: "https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg" },
];

const formSchema = z.object({
  nom_du_job: z.string().min(1, "Le nom du job est requis"),
  code_postale: z
    .string()
    .length(4, "Le code postal doit contenir 4 chiffres")
    .regex(/^\d+$/, "Le code postal doit contenir uniquement des chiffres"),
  rayon: z.string(),
});

const JobSearch = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "asc" | "desc" | "agency_asc" | "agency_desc"
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearchId = searchParams.get('searchId');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["supabase-jobs", currentSearchId],
    queryFn: async () => {
      console.log("Running query with searchId:", currentSearchId);
      if (!currentSearchId) {
        console.log("No searchId provided, returning empty result");
        return { data: [], count: 0 };
      }

      try {
        console.log("Fetching data for searchId:", currentSearchId);
        const { data, error, count } = await supabase
          .from("job_results")
          .select("*", { count: "exact" })
          .eq("search_id", currentSearchId.trim());

        if (error) {
          console.error("Error fetching data:", error);
          throw error;
        }

        console.log("Query results:", { data, count });

        // Apply filters to the data in memory
        let filteredData = data || [];

        if (searchQuery) {
          console.log("Applying search filter:", searchQuery);
          filteredData = filteredData.filter(job => 
            job.job_title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (excludedWords.length > 0) {
          console.log("Applying excluded words:", excludedWords);
          filteredData = filteredData.filter(job => 
            !excludedWords.some(word => 
              job.job_title.toLowerCase().includes(word.toLowerCase())
            )
          );
        }

        // Apply sorting
        if (sortOrder) {
          console.log("Applying sort order:", sortOrder);
          filteredData = [...filteredData].sort((a, b) => {
            if (sortOrder === "asc") {
              return a.job_title.localeCompare(b.job_title);
            } else if (sortOrder === "desc") {
              return b.job_title.localeCompare(a.job_title);
            } else if (sortOrder === "agency_asc") {
              return (a.job_location || "").localeCompare(b.job_location || "");
            } else if (sortOrder === "agency_desc") {
              return (b.job_location || "").localeCompare(a.job_location || "");
            }
            return 0;
          });
        }

        return { 
          data: filteredData, 
          count: filteredData.length 
        };

      } catch (error) {
        console.error("Query failed:", error);
        toast({
          variant: "destructive",
          title: "Erreur de récupération",
          description: "Erreur lors de la récupération des données",
        });
        return { data: [], count: 0 };
      }
    },
    enabled: !!currentSearchId,
    refetchInterval: 5000, // Refetch every 5 seconds while the component is mounted
    staleTime: 0, // Consider data always stale to ensure fresh data on mount
    gcTime: 0, // Don't cache the results (formerly cacheTime)
    retry: 3, // Retry failed requests 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  const periodicRefresh = () => {
    let count = 0;
    const interval = setInterval(() => {
      if (currentSearchId) {
        console.log("Polling for results, attempt:", count + 1);
        queryClient.invalidateQueries({ queryKey: ["supabase-jobs", currentSearchId] });
      }
      count++;
      if (count >= 30) {
        clearInterval(interval);
        setIsSubmitting(false);
        toast({
          title: "Mise à jour terminée",
          description: "La recherche est terminée.",
        });
      }
    }, 3000);
    return interval;
  };

  const handleDelete = async () => {
    setIsDeletingLoading(true);
    try {
      const response = await fetch("https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=delete");
      if (!response.ok) throw new Error("Failed to trigger deletion");

      toast({
        title: "R��initialisation en cours",
        description: "La base de données est en cours de réinitialisation...",
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (currentSearchId) {
        await queryClient.invalidateQueries({ queryKey: ["supabase-jobs", currentSearchId] });
      }

      navigate('/job-search');

      toast({
        title: "Réinitialisation terminée",
        description: "La base de données a été réinitialisée avec succès.",
      });
    } catch (error: any) {
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
      const search_id = 'search_' + Date.now();
      console.log("Generated new search_id:", search_id);
      console.log("Full search parameters:", {
        job: values.nom_du_job,
        postal: values.code_postale,
        radius: values.rayon,
        searchId: search_id
      });
      
      navigate(`/job-search?searchId=${search_id}`);
      
      console.log("Making request to Make.com webhook...");
      const webhookUrl = `https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape&nom_du_job=${encodeURIComponent(values.nom_du_job)}&code_postale=${encodeURIComponent(values.code_postale)}&rayon=${encodeURIComponent(values.rayon)}&searchId=${encodeURIComponent(search_id)}`;
      
      console.log("Webhook URL:", webhookUrl);
      const response = await fetch(webhookUrl, { method: "GET" });

      console.log("Webhook response status:", response.status);
      if (!response.ok) {
        console.error("Make.com webhook error:", response.status);
        const responseText = await response.text();
        console.error("Webhook error response:", responseText);
        throw new Error("Erreur lors de la recherche");
      }

      console.log("Make.com webhook request successful");
      console.log("Waiting 5 seconds before starting polling...");

      await new Promise(resolve => setTimeout(resolve, 5000));

      // Let's verify the search ID is still correct
      console.log("Starting polling with search_id:", search_id);
      await queryClient.invalidateQueries({ queryKey: ['supabase-jobs', search_id] });
      periodicRefresh();

      setTimeout(() => {
        setShowLoadingDialog(false);
      }, 15000);
      
    } catch (error) {
      console.error("Search submission error:", error);
      console.error("Full error object:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
      });
      setIsSubmitting(false);
      setShowLoadingDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#0A0F1E] to-[#1A1F2C] border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Recherche en cours
            </DialogTitle>
            <DialogDescription className="space-y-6">
              <p className="text-center text-gray-300 text-lg">
                Notre algorithme recherche pour vous toutes les offres d'emplois
                à pourvoir publiés sur les sites de toutes les grandes intérims
                wallonnes.
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
                              img.src = "/placeholder.svg";
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
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
                      "Réinitialiser"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Chargement des résultats...
                </p>
              </div>
            </div>
          ) : (
            <>
              {user && jobs?.count > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {jobs.count} offre{jobs.count > 1 ? "s" : ""} d'emploi
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      trouvée{jobs.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
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

              {jobs?.data && jobs.data.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agence
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Poste
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Localisation
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {jobs.data.map((job) => {
                          const agency = agencies.find(a => 
                            job.job_title?.toLowerCase().includes(a.name.toLowerCase()) ||
                            job.job_location?.toLowerCase().includes(a.name.toLowerCase())
                          );

                          return (
                            <tr 
                              key={job.id} 
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {agency ? (
                                    <img
                                      src={agency.img}
                                      alt={`${agency.name} logo`}
                                      className="h-8 w-8 rounded-full object-contain"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = "/placeholder.svg";
                                      }}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <Box className="h-4 w-4 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {agency?.name || "Agence"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 font-medium">
                                  {job.job_title}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                  {job.job_location || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <a
                                  href={job.job_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  Voir l'offre
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : currentSearchId ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Box className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-sm text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Commencez votre recherche
                  </h3>
                  <p className="text-sm text-gray-500">
                    Utilisez le formulaire ci-dessus pour rechercher des offres d'emploi
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
