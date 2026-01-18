import { Instagram, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif mb-4">Kozhikode Reconnect</h3>
            <p className="text-sm opacity-90">
              Reviving the cultural heritage of Kozhikode through authentic products and community connections.
            </p>
          </div>

          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate?.('about')} 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('marketplace')} 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Marketplace
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('seller')} 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Become a Seller
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('contact')} 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('backend-demo')} 
                  className="opacity-90 hover:opacity-100 transition-opacity text-yellow-200"
                >
                  🔧 Backend Demo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('test-backend')} 
                  className="opacity-90 hover:opacity-100 transition-opacity text-blue-200"
                >
                  ✅ Test Suite
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('pitch')} 
                  className="opacity-90 hover:opacity-100 transition-opacity text-green-200"
                >
                  🎯 Pitch Deck
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <a href="mailto:saumaya16@iimk.edu.in" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity">
                <Mail className="w-4 h-4" />
                saumaya16@iimk.edu.in
              </a>
              <a href="https://instagram.com/kozhikodereconnect" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity">
                <Instagram className="w-4 h-4" />
                @kozhikodereconnect
              </a>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                Bangalore, Karnataka
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
          <p>&copy; {new Date().getFullYear()} Kozhikode Reconnect - Revival Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}