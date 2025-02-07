
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-[#1a1f2e] border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo className="text-white" />
            <p className="text-gray-400 mt-2">
              Votre plateforme centralisée pour les offres d'emploi en logistique à Liège
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a href="/" className="text-gray-400 hover:text-blue-400">Accueil</a>
            <a href="/job-search" className="text-gray-400 hover:text-blue-400">Rechercher</a>
            <a href="/favoris" className="text-gray-400 hover:text-blue-400">Favoris</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Intérim centrale. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
