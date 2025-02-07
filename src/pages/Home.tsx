
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { LogoCarousel } from "@/components/ui/logo-carousel";

const Home = () => {
  const navigate = useNavigate();
  const plugin = Autoplay({ delay: 2000 });
  const isMobile = useIsMobile();

  const agencies = [
    { name: "Proselect", id: 1, img: "/proselect-logo.jpg" },
    { name: "Tempo-Team", id: 2, img: "/tempo-team-logo.png" },
    { name: "Adecco", id: 3, img: "/adecco-logo.jpg" },
    { name: "ASAP", id: 4, img: "/asap-logo.png" },
    { name: "Synergie", id: 5, img: "/synergie-logo.jpg" },
    { name: "Randstad", id: 6, img: "/randstad-logo.jpg" },
    { name: "Accent Jobs", id: 7, img: "/accent-jobs-logo.jpg" },
    { name: "Start People", id: 8, img: "/start-people-logo.png" },
    { name: "AGO Jobs", id: 9, img: "/ago-jobs-logo.svg" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AuroraBackground>
        <div className="container mx-auto px-4">
          {/* Hero Section with proper spacing */}
          <section className="pt-24 md:pt-32 pb-20">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
                Trouvez votre nouveau job bien plus vite grâce à{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Intérim centrale
                </span>
              </h1>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card dark:bg-[#1A1F2C]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg dark:shadow-[#403E43]/20">
                  <h2 className="text-2xl font-semibold mb-4">
                    Plus de 10 agences intérim en un seul endroit
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Nous rassemblons automatiquement toutes les offres d'emploi en logistique de la région liégeoise 
                    provenant des meilleures agences intérim. Plus besoin de visiter des dizaines de sites différents !
                  </p>
                  <Button 
                    onClick={() => navigate('/job-search')} 
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
                  >
                    Rechercher
                  </Button>
                </div>

                <div className="bg-card dark:bg-[#1A1F2C]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg dark:shadow-[#403E43]/20">
                  <img
                    src="https://www.sapir.ac.il/sites/default/files/styles/box_image/public/2023-11/iStock-1437820717%20copy.jpg?itok=x-7jMRvt"
                    alt="Happy woman at job interview"
                    className="rounded-lg shadow-xl w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Agencies Section */}
          <section className="py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl font-semibold mb-12">Les agences d'intérim intégrés dans notre plateforme</h3>
              {isMobile ? (
                <div className="grid grid-cols-2 gap-4">
                  {agencies.map((agency, index) => (
                    <div key={index} className="aspect-square">
                      <div className="h-full bg-card dark:bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center shadow-lg dark:shadow-[#403E43]/20">
                        <img
                          src={agency.img}
                          alt={`${agency.name} logo`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                          <div className="bg-card dark:bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg p-4 h-24 flex items-center justify-center shadow-lg dark:shadow-[#403E43]/20">
                            <img
                              src={agency.img}
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
              )}
            </div>
          </section>
        </div>
      </AuroraBackground>
    </div>
  );
};

export default Home;
