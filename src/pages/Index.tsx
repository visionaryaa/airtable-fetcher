import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AirtableTable from "@/components/AirtableTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Sun, Plus, Heart, LogOut, User, Home } from "lucide-react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddWord = () => {
    if (newWord && !excludedWords.includes(newWord)) {
      setExcludedWords(prev => [...prev, newWord]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setExcludedWords(excludedWords.filter(word => word !== wordToRemove));
  };

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

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <h1 className="text-xl font-semibold">Intérim centrale</h1>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-1 hover:text-blue-400">
                <Home className="w-4 h-4" />
                Accueil
              </a>
              <a href="/jobs" className="hover:text-blue-400">Offres</a>
              {user && (
                <a 
                  href="/favoris" 
                  className="flex items-center gap-1 hover:text-blue-400"
                >
                  <Heart className="w-4 h-4" />
                  Favoris
                </a>
              )}
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative flex items-center gap-2 border border-border hover:bg-secondary rounded-lg px-4 py-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAuthClick}
                >
                  Connexion
                </Button>
              )}
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

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Rechercher un poste..."
                    className="w-full bg-[#2a2f3d] border-gray-700 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>

            <div className="bg-[#2a2f3d] p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Mots à exclure des résultats</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ajouter un mot à exclure"
                  className="bg-[#1a1f2e] border-gray-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWord();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddWord} 
                  className="bg-blue-600 hover:bg-blue-700"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {excludedWords.map((word) => (
                  <div
                    key={word}
                    className="flex items-center gap-1 bg-[#1a1f2e] px-3 py-1 rounded-full"
                  >
                    <span>{word}</span>
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
