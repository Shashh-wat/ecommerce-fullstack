import { Mail, Instagram, MapPin, Phone, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useState } from 'react';

export function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      value: 'saumaya16@iimk.edu.in',
      link: 'mailto:saumaya16@iimk.edu.in',
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      title: 'Instagram',
      value: '@kozhikodereconnect',
      link: 'https://instagram.com/kozhikodereconnect',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      value: '+91 9149211843',
      link: 'tel:+919149211843',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Location',
      value: '28032 Sobha Dream Acres, Bangalore, Karnataka',
      link: null,
    },
  ];

  return (
    <div>
      {/* Hero with Background */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1661357947468-858edbffc900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3poaWtvZGUlMjBjaHVyY2glMjBLZXJhbGF8ZW58MXx8fHwxNzYyNzUxNDkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
            alt="Historic Churches - Kozhikode Heritage"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="font-serif text-4xl md:text-5xl mb-6 drop-shadow-lg">Contact Us</h1>
            <p className="text-lg drop-shadow-md">
              Have questions or suggestions? We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {contactInfo.map((info, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {info.icon}
                </div>
                <h3 className="mb-2">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{info.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <h2 className="font-serif text-2xl mb-6 text-primary">Send us a Message</h2>
              
              {formSubmitted ? (
                <div className="text-center py-8">
                  <Send className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="mb-2">Business Hours</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
              <CardContent className="p-8">
                <h3 className="font-serif text-xl mb-4 text-primary">Visit Our Office</h3>
                <p className="text-muted-foreground mb-4">
                  We're located in Bangalore. Feel free to visit us during business 
                  hours for product demonstrations and consultations.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>28032 Sobha Dream Acres<br />Bangalore, Karnataka</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/10 border-2 border-secondary/30">
              <CardContent className="p-8">
                <h3 className="font-serif text-xl mb-4 text-secondary">Follow Us</h3>
                <p className="text-muted-foreground mb-4">
                  Stay updated with our latest products, seller stories, and cultural insights.
                </p>
                <a
                  href="https://instagram.com/kozhikodereconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  Follow on Instagram
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 mt-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl mb-8 text-center text-primary">
            Quick Answers
          </h2>
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">How quickly will I get a response?</h4>
                <p className="text-sm text-muted-foreground">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">Can I visit your office?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! We welcome visitors during business hours. We recommend calling ahead to ensure someone is available.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">Do you offer bulk orders?</h4>
                <p className="text-sm text-muted-foreground">
                  Absolutely! Contact us with your requirements and we'll connect you with the right sellers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
