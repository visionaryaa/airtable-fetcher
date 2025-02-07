import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuroraBackground } from "@/components/ui/aurora-background";

const Home = () => {
  const navigate = useNavigate();
  const plugin = Autoplay({ delay: 2000 });
  const isMobile = useIsMobile();

  const agencies = [
    { 
      name: "Proselect", 
      logo: "https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/424861504_903474951786484_6860552531033903105_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=9f87pSSpry0Q7kNvgFyrnoT&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ak1S7cV8uODElYBPLoC2BP7&oh=00_AYD11qaICw8KiEXJHPd2k0JeIOgaHaTW9IRlvZoyE62k0g&oe=67A1CC7A" 
    },
    { 
      name: "Tempo-Team", 
      logo: "https://i.postimg.cc/KjzxPhbD/352321179-802641697768990-7499832421124251242-n.png" 
    },
    { 
      name: "Adecco", 
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s" 
    },
    { 
      name: "ASAP", 
      logo: "https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png" 
    },
    { 
      name: "Synergie", 
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s" 
    },
    { 
      name: "Randstad", 
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s" 
    },
    { 
      name: "Accent Jobs", 
      logo: "https://scontent-bru2-1.xx.fbcdn.net/v/t39.30808-1/282401818_7471306532942250_8129507684428268966_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=V7V32kIB9kQQ7kNvgGrchjq&_nc_zt=24&_nc_ht=scontent-bru2-1.xx&_nc_gid=AxGzm78UeCGDdyODeeOkUVP&oh=00_AYCkOMbUGq7QW9APk_A0wqGGCWF4f3gkf8SaipnTsGtuZA&oe=67A1EB3A" 
    },
    { 
      name: "Start People", 
      logo: "https://startpeople.be/images/default-source/start-people-images/start-people-logo.png" 
    },
    { 
      name: "AGO Jobs", 
      logo: "https://www.agojobs.com/themes/custom/ago/logo.svg" 
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <AuroraBackground className="w-full">
        <main>
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto space-y-12">
              <p className="text-4xl font-bold text-center">
                Trouvez votre nouveau job bien plus vite grâce à{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Intérim centrale
                </span>
              </p>
              
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

            <div className="mt-16">
              <h3 className="text-xl font-semibold mb-8">Les agences d'intérim intégrés dans notre plateforme</h3>
              {isMobile ? (
                <div className="grid grid-cols-2 gap-2">
                  {agencies.map((agency, index) => (
                    <div key={index} className="aspect-square">
                      <div className="h-full bg-card dark:bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg p-2 flex items-center justify-center shadow-lg dark:shadow-[#403E43]/20">
                        <img
                          src={agency.logo}
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
              )}
            </div>
          </div>
        </main>
      </AuroraBackground>
    </div>
  );
};

export default Home;
