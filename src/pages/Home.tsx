import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const plugin = Autoplay({ delay: 2000 });

  const agencies = [
    { name: "Adecco", logo: "/agencies/adecco.png" },
    { name: "Manpower", logo: "/agencies/manpower.png" },
    { name: "Randstad", logo: "/agencies/randstad.png" },
    { name: "Start People", logo: "/agencies/start-people.png" },
    { name: "Tempo-Team", logo: "/agencies/tempo-team.png" },
    { name: "Unique", logo: "/agencies/unique.png" },
    { name: "AGO", logo: "/agencies/ago.png" },
    { name: "Forum Jobs", logo: "/agencies/forum-jobs.png" },
    { name: "Accent Jobs", logo: "/agencies/accent.png" },
    { name: "Synergie", logo: "/agencies/synergie.png" }
  ];

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Intérim centrale
              </h1>
              
              <p className="text-2xl text-gray-300 mb-8">
                Trouvez votre nouveau job bien plus vite grâce à Intérim centrale
              </p>
              
              <div className="bg-[#2a2f3d] p-8 rounded-xl shadow-2xl mb-12">
                <h2 className="text-2xl font-semibold mb-4">
                  Plus de 10 agences intérim en un seul endroit
                </h2>
                <p className="text-gray-300 mb-6">
                  Nous rassemblons automatiquement toutes les offres d'emploi en logistique de la région liégeoise 
                  provenant des meilleures agences intérim. Plus besoin de visiter des dizaines de sites différents !
                </p>
                <Button 
                  onClick={() => navigate('/jobs')} 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                >
                  Voir les offres
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src="https://www.sapir.ac.il/sites/default/files/styles/box_image/public/2023-11/iStock-1437820717%20copy.jpg?itok=x-7jMRvt"
                alt="Happy woman at job interview"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-8">Nos agences partenaires</h3>
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin]}
              className="w-full"
            >
              <CarouselContent>
                {agencies.map((agency, index) => (
                  <CarouselItem key={index} className="basis-1/4 md:basis-1/5">
                    <div className="p-2">
                      <div className="bg-white rounded-lg p-4 h-24 flex items-center justify-center">
                        <img
                          src={agency.logo}
                          alt={`${agency.name} logo`}
                          className="max-h-16 w-auto object-contain"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;