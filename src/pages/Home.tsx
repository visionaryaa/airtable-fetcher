
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedBeamDemo } from "@/components/ui/animated-beam-demo";

const Home = () => {
  const navigate = useNavigate();
  const plugin = Autoplay({ delay: 2000 });
  const isMobile = useIsMobile();

  const agencies = [
    { name: "Proselect", id: 1, img: "https://i.postimg.cc/tg2Xq57M/IMG-7594.png" },
    { name: "Tempo-Team", id: 2, img: "https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png" },
    { name: "Adecco", id: 3, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s" },
    { name: "ASAP", id: 4, img: "https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png" },
    { name: "Synergie", id: 5, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s" },
    { name: "Randstad", id: 6, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s" },
    { name: "Accent Jobs", id: 7, img: "https://i.postimg.cc/053yKcZg/IMG-7592.png" },
    { name: "Start People", id: 8, img: "https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc" },
    { name: "AGO Jobs", id: 9, img: "https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png" },
    { name: "SD Worx", id: 10, img: "https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png" },
    { name: "Robert Half", id: 11, img: "https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg" }
  ];

  return (
    <>
      <AuroraBackground className="fixed inset-0 -z-10">
        <div className="absolute inset-0" />
      </AuroraBackground>

      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-24 md:py-28">
            {/* Hero Section */}
            <section className="mb-20">
              <div className="mx-auto max-w-6xl">
                <h1 className="mb-16 text-4xl font-bold text-center md:text-5xl">
                  Trouvez votre nouveau job bien plus vite grâce à{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Intérim centrale
                  </span>
                </h1>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-xl">
                    <h2 className="text-2xl font-semibold mb-4">
                      Plus de 15 agences intérim en un seul endroit
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Nous rassemblons automatiquement toutes les offres d'emploi en Belgique
                      provenant de toutes les principales agences d'intérim de Wallonie. Plus besoin de visiter des dizaines de sites différents !
                    </p>
                    <Button 
                      onClick={() => navigate('/job-search')} 
                      className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
                    >
                      Rechercher
                    </Button>
                  </div>

                  <div className="p-8 rounded-xl">
                    <img
                      src="https://www.sapir.ac.il/sites/default/files/styles/box_image/public/2023-11/iStock-1437820717%20copy.jpg?itok=x-7jMRvt"
                      alt="Happy woman at job interview"
                      className="rounded-lg shadow-xl w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Section with AnimatedBeamDemo */}
            <section className="mb-20">
              <div className="mx-auto max-w-6xl">
                <h2 className="text-3xl font-semibold text-center mb-12">
                  Optimisez votre processus de recrutement
                </h2>
                <div className="relative w-full max-w-4xl mx-auto z-10">
                  <AnimatedBeamDemo />
                </div>
              </div>
            </section>

            {/* Agencies Section */}
            <section className="py-12 md:py-20">
              <div className="mx-auto max-w-6xl">
                <h3 className="text-xl font-semibold mb-8">
                  Les agences d'intérim intégrés dans notre plateforme
                </h3>
                {isMobile ? (
                  <div className="grid grid-cols-2 gap-4">
                    {agencies.map((agency, index) => (
                      <div key={index} className="aspect-square">
                        <div className="h-full rounded-lg p-4 flex items-center justify-center shadow-lg">
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
                            <div className="rounded-lg p-4 h-24 flex items-center justify-center shadow-lg">
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
        </div>
      </div>
    </>
  );
};

export default Home;
