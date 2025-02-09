import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Search, Loader2 } from "lucide-react";
import AirtableTable from "@/components/AirtableTable";
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

  const periodicRefresh = () => {
    let count = 0;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['airtable'] });
      count++;
      if (count >= 6) {  // 6 times * 5 seconds = 30 seconds
        clearInterval(interval);
        setIsSubmitting(false);
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

      // Wait for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh the table data
      await queryClient.invalidateQueries({ queryKey: ['airtable'] });
      
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
      const response = await fetch(
        `https://hook.eu2.make.com/gy4hlfyzdj35pijcgllbh11ke7bldn52?action=scrape&nom_du_job=${encodeURIComponent(values.nom_du_job)}&code_postale=${encodeURIComponent(values.code_postale)}&rayon=${encodeURIComponent(values.rayon)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      // Wait for 10 seconds with the dialog open
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Close the dialog after 10 seconds
      setShowLoadingDialog(false);

      // Refresh data initially after dialog closes
      await queryClient.invalidateQueries({ queryKey: ['airtable'] });

      // Start periodic refresh
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="nom_du_job"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du job</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Manutentionnaire" {...field} />
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
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 1000"
                          maxLength={4}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            if (value.length <= 4) {
                              field.onChange(value);
                            }
                          }}
                        />
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
                      <FormLabel>Rayon de recherche</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rayon" />
                          </SelectTrigger>
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

                <div className="flex gap-2">
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
            sortOrder={sortOrder}
            searchQuery={searchQuery}
            excludedWords={excludedWords}
            baseKey="customSearch"
          />
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
