const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Bienvenue sur Intérim centrale</h1>
      <p className="text-lg mb-4">
        Votre plateforme centralisée pour les offres d'emploi en logistique à Liège
      </p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Comment ça marche ?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">1. Recherchez</h3>
            <p className="text-muted-foreground">
              Parcourez les offres d'emploi de différentes agences d'intérim en un seul endroit.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">2. Filtrez</h3>
            <p className="text-muted-foreground">
              Utilisez nos filtres pour affiner votre recherche et trouver les offres qui vous correspondent.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">3. Postulez</h3>
            <p className="text-muted-foreground">
              Cliquez sur les offres qui vous intéressent pour postuler directement sur le site de l'agence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;