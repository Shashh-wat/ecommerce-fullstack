import { Target, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import saumayaPhoto from 'figma:asset/d0a680afb12b09ccade96928c6ae8bde2946fb7f.png';
import lameesPhoto from 'figma:asset/0be953137f626a1956d29c16e700bbd90c2daf8c.png';
import ashishPhoto from 'figma:asset/c79a41e20840a993b39b5febe63093b056a59e79.png';
import nasrullahPhoto from 'figma:asset/1c4f67fd4edf4dd05fc69e00b1a0ddde352cda1e.png';

export function AboutPage() {
  const team = [
    {
      name: 'Saumaya Gupta',
      role: 'Founder & CEO',
      bio: 'Passionate about preserving cultural heritage through modern commerce.',
      image: saumayaPhoto,
    },
    {
      name: 'Ashish Sagar',
      role: 'Community Manager',
      bio: 'Building bridges between tradition and innovation.',
      image: ashishPhoto,
    },
    {
      name: 'Nasrullah',
      role: 'Quality Assurance',
      bio: 'Ensuring authenticity in every product we offer.',
      image: nasrullahPhoto,
    },
    {
      name: 'Lamees',
      role: 'Head of Marketplace',
      bio: 'Connecting artisans with customers worldwide.',
      image: lameesPhoto,
    },
  ];

  return (
    <div>
      {/* Hero with Background - Mishkal Mosque Kozhikode */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1713252977982-93656456f997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNaXNoa2FsJTIwTW9zcXVlJTIwS296aGlrb2RlJTIwS2VyYWxhfGVufDF8fHx8MTc2Mjc1MTI1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
            alt="Mishkal Mosque - Historic Kozhikode Landmark"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="font-serif text-4xl md:text-5xl mb-6 drop-shadow-lg">About Us</h1>
            <p className="text-lg drop-shadow-md mb-4">
              Kozhikode Reconnect - Revival Hub is a cultural e-commerce platform dedicated to 
              preserving and promoting the rich heritage of Kozhikode through authentic products 
              and meaningful community connections.
            </p>
            <p className="text-sm drop-shadow-md opacity-90">
              Born at IIM Kozhikode, rooted in tradition, driven by innovation
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-2xl mb-4 text-primary">Our Vision</h2>
              <p className="text-muted-foreground">
                To become the leading platform that celebrates and sustains Kozhikode's cultural 
                heritage by empowering local artisans and connecting them with a global audience 
                who values authenticity and tradition.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="font-serif text-2xl mb-4 text-secondary">Our Mission</h2>
              <p className="text-muted-foreground">
                To create a thriving marketplace that preserves traditional crafts, promotes 
                authentic local products, and provides sustainable income opportunities for 
                Kozhikode's artisans while fostering community engagement and cultural pride.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl text-center mb-12 text-primary">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="mb-2">Authenticity</h3>
              <p className="text-sm text-muted-foreground">
                Every product tells a genuine story of Kozhikode's cultural heritage
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Building strong connections between artisans, sellers, and customers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                Maintaining the highest standards in every product and service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl text-center mb-4 text-primary">Meet Our Team</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Passionate individuals dedicated to reviving and celebrating Kozhikode's rich cultural heritage
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {team.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {member.image ? (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/20">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                )}
                <h3 className="mb-1">{member.name}</h3>
                <p className="text-sm text-secondary mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto bg-card border-2 border-border rounded-lg p-8">
          <h2 className="font-serif text-2xl mb-4 text-primary">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Kozhikode Reconnect was born from a simple observation: the incredible artisans 
              and traditional crafts of Kozhikode were struggling to find their place in the 
              modern marketplace.
            </p>
            <p>
              Founded in 2025 at IIM Kozhikode, we set out to create a platform that honors tradition while 
              embracing innovation. Our marketplace connects skilled artisans with customers 
              who appreciate authentic, handcrafted products that carry the essence of 
              Kozhikode's cultural heritage.
            </p>
            <p>
              Today, we're proud to support hundreds of local sellers and thousands of 
              satisfied customers who share our passion for preserving and promoting the 
              unique flavors, crafts, and traditions that make Kozhikode special.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}