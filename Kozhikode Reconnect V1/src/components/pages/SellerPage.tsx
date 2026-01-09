import { CheckCircle2, TrendingUp, Users, Shield, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';

const sellerHeroImage = "https://images.unsplash.com/photo-1619318029480-af377108f595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjB0ZW1wbGUlMjBmcm9udCUyMGVudHJhbmNlfGVufDF8fHx8MTc2MDYzMTA4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface SellerPageProps {
  onNavigate?: (page: string) => void;
}

export function SellerPage({ onNavigate }: SellerPageProps = {}) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { isAuthenticated } = useAuth();

  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Wide Customer Reach',
      description: 'Connect with customers across India and beyond who value authentic products.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Grow Your Business',
      description: 'Access marketing tools and insights to scale your business effectively.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Transactions',
      description: 'Safe and secure payment processing with timely payouts.',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Competitive Fees',
      description: 'Low commission rates to help you maximize your earnings.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div>
      {/* Hero with Background */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img 
            src={sellerHeroImage} 
            alt="Small Business Owner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="font-serif text-4xl md:text-5xl mb-6 drop-shadow-lg">Become a Seller</h1>
            <p className="text-lg drop-shadow-md mb-6">
              Join our community of artisans and entrepreneurs. Share your authentic Kozhikode 
              products with customers who truly appreciate quality and tradition.
            </p>
            {isAuthenticated && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate?.('seller-dashboard')}
                className="bg-white text-primary hover:bg-white/90"
              >
                Go to Seller Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="font-serif text-3xl text-center mb-12 text-primary">Why Sell With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 mb-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl text-center mb-12 text-primary">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span>1</span>
                </div>
                <h3 className="mb-2">Apply</h3>
                <p className="text-sm text-muted-foreground">
                  Fill out our simple onboarding form with your business details
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span>2</span>
                </div>
                <h3 className="mb-2">Get Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your application within 48 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span>3</span>
                </div>
                <h3 className="mb-2">Start Selling</h3>
                <p className="text-sm text-muted-foreground">
                  List your products and start reaching customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Form */}
      <section className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <h2 className="font-serif text-2xl mb-6 text-center text-primary">
                Seller Application Form
              </h2>
              
              {formSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">
                    Thank you for applying. We'll review your application and get back to you within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Product Category *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="pickles">Pickles</SelectItem>
                        <SelectItem value="handicrafts">Handicrafts</SelectItem>
                        <SelectItem value="embroidery">Embroidery</SelectItem>
                        <SelectItem value="beauty">Beauty Products</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" min="0" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Tell us about your products *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your products, what makes them special, and your production process..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website or Social Media (Optional)</Label>
                    <Input id="website" type="url" placeholder="https://" />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      What happens next?
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Our team reviews your application</li>
                      <li>• You'll hear from us within 48 hours</li>
                      <li>• Once approved, you can start listing products</li>
                      <li>• We provide full onboarding support</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Submit Application
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 mt-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl mb-8 text-center text-primary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">What are the fees?</h4>
                <p className="text-sm text-muted-foreground">
                  We charge a competitive 10% commission on sales. No upfront fees or hidden charges.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">How do I get paid?</h4>
                <p className="text-sm text-muted-foreground">
                  Payments are processed weekly via bank transfer directly to your account.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">Do I need to handle shipping?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, sellers are responsible for packaging and shipping. We provide shipping label support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}