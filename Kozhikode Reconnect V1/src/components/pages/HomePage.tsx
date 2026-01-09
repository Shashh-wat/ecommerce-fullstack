import { ArrowRight, ShoppingBag, Users, Award, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CategoryImage } from '../CategoryImages';
import { DemoAccountsBanner } from '../DemoAccountsBanner';
import heroImage from 'figma:asset/87183293a5c198aa01fb692c1d2fbacd986e5d3d.png';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Authentic Products',
      description: 'Discover traditional snacks, pickles, handicrafts, and more from local artisans.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Driven',
      description: 'Connect with sellers and buyers who share a passion for Kozhikode culture.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Assured',
      description: 'Every product is carefully curated to maintain authenticity and quality.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Cultural Heritage',
      description: 'Preserving and promoting the rich cultural traditions of Kozhikode.',
    },
  ];

  const carouselSlides = [
    {
      image: heroImage,
      title: 'Kozhikode Reconnect',
      subtitle: 'Revival Hub',
      description: 'Rediscover the authentic flavors, crafts, and traditions of Kozhikode. A platform connecting cultural heritage with modern commerce.',
    },
    {
      image: 'https://images.unsplash.com/photo-1668999895830-39cc4201971c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3poaWtvZGUlMjBDYWxpY3V0JTIwbWFya2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2MzIzNDg2OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Kozhikode Market Experience',
      subtitle: 'Shop Like a Local',
      description: 'Experience the vibrant spirit of Kozhikode\'s traditional markets from the comfort of your home. Fresh, authentic, and delivered with care.',
    },
    {
      image: 'https://images.unsplash.com/photo-1761365071743-e2458a18ddce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMEluZGlhbiUyMG1hcmtldCUyMHN0YWxsc3xlbnwxfHx8fDE3NjMyMzQ4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Traditional Marketplace',
      subtitle: 'Support Local Artisans',
      description: 'Browse authentic products crafted with care by local artisans. Every purchase supports the Kozhikode community.',
    },
    {
      image: 'https://images.unsplash.com/photo-1762342345465-d021b8491309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMGNvbG9yZnVsfGVufDF8fHx8MTc2MzE0MDI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Exquisite Handicrafts',
      subtitle: 'Handmade with Love',
      description: 'Explore our collection of beautiful handicrafts, each piece telling a unique story of Kozhikode\'s rich cultural heritage.',
    },
    {
      image: 'https://images.unsplash.com/photo-1663136618135-d11b4dbd22c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZXMlMjBwaWNrbGVzfGVufDF8fHx8MTc2MzE0MDI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Authentic Flavors',
      subtitle: 'Taste of Tradition',
      description: 'Savor the authentic taste of Kozhikode with our range of traditional snacks, pickles, and delicacies.',
    },
  ];

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden hero-carousel">
        <Carousel plugins={[plugin.current]}>
          <CarouselContent>
            {carouselSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[600px] md:h-[700px] overflow-hidden">
                  <div className="absolute inset-0">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
                  </div>
                  <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
                    <div className="max-w-4xl mx-auto text-center text-white">
                      <h1 className="font-serif text-5xl md:text-7xl mb-6 drop-shadow-lg animate-fade-in">
                        {slide.title}
                      </h1>
                      <h2 className="text-3xl md:text-4xl mb-8 drop-shadow-lg">
                        {slide.subtitle}
                      </h2>
                      <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-md">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                          size="lg" 
                          className="bg-primary hover:bg-primary/90 shadow-lg"
                          onClick={() => onNavigate('marketplace')}
                        >
                          Explore Marketplace
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button 
                          size="lg" 
                          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                          onClick={() => onNavigate('seller')}
                        >
                          Join as Seller
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2">
            <ArrowRight className="w-5 h-5 transform rotate-180" />
          </CarouselPrevious>
          <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2">
            <ArrowRight className="w-5 h-5" />
          </CarouselNext>
        </Carousel>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12 text-primary">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Preview */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 text-primary">
            Featured Categories
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Browse through our carefully curated collection of authentic Kozhikode products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {['Snacks', 'Pickles', 'Handicrafts', 'Embroidery', 'Beauty'].map((category, index) => (
              <button
                key={index}
                onClick={() => onNavigate('marketplace')}
                className="group bg-card border-2 border-border hover:border-primary rounded-lg overflow-hidden text-center transition-all hover:shadow-lg"
              >
                <div className="h-32 overflow-hidden">
                  <CategoryImage 
                    category={category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm md:text-base">{category}</h3>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button 
              variant="outline"
              onClick={() => onNavigate('marketplace')}
            >
              View All Categories
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              Ready to Share Your Craft?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of artisans and entrepreneurs. Start selling your authentic products today.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('seller')}
            >
              Become a Seller Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Accounts Banner */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <DemoAccountsBanner onNavigate={onNavigate} />
        </div>
      </section>
    </div>
  );
}