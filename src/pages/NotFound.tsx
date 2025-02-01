import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page non trouvée</h1>
      <p className="text-lg mb-8">
        La page que vous recherchez n'existe pas.
      </p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
};

export default NotFound;