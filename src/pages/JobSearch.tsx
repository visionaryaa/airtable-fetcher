import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
import { Search, MapPin, Radio, Loader2, ChevronDown, Box, Calendar, LayoutGrid, Table2, Heart } from "lucide-react";
import SearchFilters from "@/components/jobs/SearchFilters";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const agencies = [
  { 
    name: "Proselect", 
    id: 1, 
    img: "https://i.postimg.cc/tg2Xq57M/IMG-7594.png",
    domain: "proselect.be",
    keywords: ["proselect"]
  },
  { 
    name: "Tempo-Team", 
    id: 2, 
    img: "https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png",
    domain: "tempo-team.be",
    keywords: ["tempo-team", "tempo team", "tempoteam"]
  },
  { 
    name: "Adecco", 
    id: 3, 
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s",
    domain: "adecco.be",
    keywords: ["adecco"]
  },
  { 
    name: "ASAP", 
    id: 4, 
    img: "https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png",
    domain: "asap.be",
    keywords: ["asap"]
  },
  { 
    name: "Synergie", 
    id: 5, 
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s",
    domain: "synergiejobs.be",
    keywords: ["synergie"]
  },
  { 
    name: "Randstad", 
    id: 6, 
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s",
    domain: "randstad.be",
    keywords: ["randstad", "rand stad"]
  },
  { 
    name: "Accent Jobs", 
    id: 7, 
    img: "https://i.postimg.cc/053yKcZg/IMG-7592.png",
    domain: "accentjobs.be",
    keywords: ["accent", "accent jobs"]
  },
  { 
    name: "Start People", 
    id: 8, 
    img: "https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc",
    domain: "startpeople.be",
    keywords: ["start people", "startpeople"]
  },
  { 
    name: "Daoust",
    id: 9, 
    img: "https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png",
    domain: "dajobs.be",
    keywords: ["ago jobs", "ago job", "agojobs", "dajobs", "daoust", "ago", "AGO Jobs"]
  },
  { 
    name: "SD Worx", 
    id: 10, 
    img: "https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png",
    domain: "sdworx.jobs",
    keywords: ["sd worx", "sdworx"]
  },
  { 
    name: "Robert Half", 
    id: 11, 
    img: "https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg",
    domain: "roberthalf.com",
    keywords: ["robert half"]
  },
  {
    name: "Bright Plus",
    id: 12,
    img: "https://i.postimg.cc/8c6fdhKY/image.png",
    domain: "brightplus.be",
    keywords: ["bright plus", "brightplus"]
  }
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
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "agency_asc" | "agency_desc">();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const currentSearchId = searchParams.get('searchId');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_du_job: "",
      code_postale: "",
      rayon: "25",
    },
  });

  const addToFavorites = useMutation({
    mutationFn: async (job: any) => {
      if (!user) throw new Error('Must be logged in to add favorites');
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          job_title: job.job_title,
          job_link: job.job_link,
          job_location: job.job_location
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Ajouté aux favoris",
        description: "L'offre a été ajoutée à vos favoris",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter aux favoris",
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
        title: "Retiré des favoris",
        description: "L'offre a été retirée de vos favoris",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de retirer des favoris",
        });
      }
    }
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('job_link')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(f => f.job_link);
    },
    enabled: !!user,
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["supabase-jobs", currentSearchId],
    queryFn: async () => {
      if (!currentSearchId) return { data: [], count: 0 };
      const { data: jobResults, error, count } = await supabase
        .from("job_results")
        .select("*", { count: "exact" })
        .eq("search_id", currentSearchId);
      if (error) throw error;
      return { data: jobResults || [], count: count || 0 };
    },
    enabled: !!currentSearchId,
  });

  const handleFavoriteClick = (job: any, isFavorited: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris",
      });
      return;
    }

    if (isFavorited) {
      removeFromFavorites.mutate(job.job_link);
    } else {
      addToFavorites.mutate(job);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setShowLoadingDialog(true);
    
    try {
      const search_id = 'search_' + Date.now();
      const webhookUrl = `https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape&nom_du_job=${encodeURIComponent(values.nom_du_job)}&code_postale=${encodeURIComponent(values.code_postale)}&rayon=${encodeURIComponent(values.rayon)}&searchId=${encodeURIComponent(search_id)}`;
      
      const response = await fetch(webhookUrl);
      if (!response.ok) throw new Error('Webhook error');

      navigate(`/job-search?searchId=${search_id}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      queryClient.invalidateQueries({ queryKey: ["supabase-jobs", search_id] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
      });
    } finally {
      setIsSubmitting(false);
      setShowLoadingDialog(false);
    }
  };

  const findAgency = (job: any) => {
    return agencies.find(agency => 
      job.job_link?.toLowerCase().includes(agency.domain.toLowerCase()) ||
      agency.keywords.some(keyword => 
        job.job_title?.toLowerCase().includes(keyword.toLowerCase()) ||
        job.job_location?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  const handleViewChange = (value: string) => {
    setViewMode(value as "table" | "card");
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    const urlViewMode = searchParams.get('view') as "table" | "card";
    if (urlViewMode) {
      setViewMode(urlViewMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showLoadingDialog) {
      const timer = setTimeout(() => {
        setShowLoadingDialog(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showLoadingDialog]);

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs?.data.map((job) => {
        const agency = findAgency(job);
        const isFavorited = favorites.includes(job.job_link);
        let formattedDate = 'N/A';
        try {
          if (job.publication_date) {
            const date = new Date(job.publication_date);
            if (!isNaN(date.getTime())) {
              formattedDate = format(date, 'dd/MM/yyyy');
            }
          } else if (job.created_at) {
            const date = new Date(job.created_at);
            if (!isNaN(date.getTime())) {
              formattedDate = format(date, 'dd/MM/yyyy');
            }
          }
        } catch (error) {
          console.error('Error formatting date:', error);
        }

        return (
          <Card 
            key={job.id} 
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-card text-card-foreground dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600 shadow-md dark:shadow-lg dark:shadow-gray-900/20"
          >
            <CardHeader className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-1.5 shadow-sm">
                    {agency ? (
                      <img
                        src={agency.img}
                        alt={`${agency.name} logo`}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <Box className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">
                      {agency?.name || "Agence"}
                    </h3>
                    {agency?.domain && (
                      <p className="text-xs text-muted-foreground">
                        {agency.domain}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  onClick={() => handleFavoriteClick(job, isFavorited)}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <h2 className="text-lg leading-tight font-semibold line-clamp-2">
                {job.job_title}
              </h2>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="text-xs">{job.job_location || "Location non spécifiée"}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="text-xs">{formattedDate}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <a
                href={job.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-colors duration-200 dark:bg-primary/20 dark:hover:bg-primary/30"
              >
                Voir l'offre
              </a>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Titre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs?.data.map((job) => {
            const agency = findAgency(job);
            const isFavorited = favorites.includes(job.job_link);
            let formattedDate = 'N/A';
            try {
              if (job.publication_date) {
                const date = new Date(job.publication_date);
                if (!isNaN(date.getTime())) {
                  formattedDate = format(date, 'dd/MM/yyyy');
                }
              } else if (job.created_at) {
                const date = new Date(job.created_at);
                if (!isNaN(date.getTime())) {
                  formattedDate = format(date, 'dd/MM/yyyy');
                }
              }
            } catch (error) {
              console.error('Error formatting date:', error);
            }

            return (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {agency ? (
                        <img
                          src={agency.img}
                          alt={`${agency.name} logo`}
                          className="h-10 w-10 rounded-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Box className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {agency?.name || "Agence"}
                      </div>
                      {agency?.domain && (
                        <div className="text-xs text-gray-500">
                          {agency.domain}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{job.job_title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{job.job_location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formattedDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Voir l'offre
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      onClick={() => handleFavoriteClick(job, isFavorited)}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

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
                            className="h-full w-full object-contain"
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
                  name="rayon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Rayon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 km</SelectItem>
                            <SelectItem value="25">25 km</SelectItem>
                            <SelectItem value="50">50 km</SelectItem>
                            <SelectItem value="100">100 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
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
              </div>
            </form>
          </Form>

          {jobs?.data && jobs.data.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {jobs.data.length} résultats
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs value={viewMode} onValueChange={handleViewChange} defaultValue="card">
                    <TabsList>
                      <TabsTrigger value="card">
                        <LayoutGrid className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="table">
                        <Table2 className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
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

              {viewMode === "card" ? renderCardView() : renderTableView()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
