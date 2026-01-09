import { useState } from 'react';
import { MessageCircle, X, Send, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

type Language = 'en' | 'ml';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Kozhikode Reconnect. How can I help you today?",
      sender: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const translations = {
    en: {
      chatTitle: "Chat with us",
      placeholder: "Type your message...",
      quickQuestions: "Quick questions:",
      greeting: "Hello! Welcome to Kozhikode Reconnect. How can I help you today?",
      quickReplies: [
        "Tell me about the marketplace",
        "How do I become a seller?",
        "What products are available?",
        "Contact information",
      ],
      responses: {
        marketplace: "Our marketplace features authentic products from Kozhikode including snacks (സ്നാക്ക്സ്), pickles (അച്ചാറുകൾ), handicrafts (കരകൗശലവസ്തുക്കൾ), embroidery (എംബ്രോയ്ഡറി), and beauty products (സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ). Click on 'Marketplace' to explore!",
        seller: "We'd love to have you as a seller! Click on 'Become a Seller' to learn about the benefits and fill out our simple onboarding form.",
        product: "We offer traditional snacks, authentic pickles, handcrafted items, beautiful embroidery work, and natural beauty products from Kozhikode artisans.",
        contact: "You can reach us at saumaya16@iimk.edu.in or follow us on Instagram @kozhikodereconnect. Visit our Contact page for more details!",
        default: "Thank you for your message. Our team will get back to you soon!",
      }
    },
    ml: {
      chatTitle: "ഞങ്ങളോട് സംസാരിക്കൂ",
      placeholder: "നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...",
      quickQuestions: "പെട്ടെന്നുള്ള ചോദ്യങ്ങൾ:",
      greeting: "നമസ്കാരം! കോഴിക്കോട് റീകണക്ടിലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
      quickReplies: [
        "മാർക്കറ്റ്പ്ലേസിനെക്കുറിച്ച് പറയൂ",
        "ഞാൻ എങ്ങനെ വിൽപ്പനക്കാരനാകും?",
        "ഏതൊക്കെ ഉൽപ്പന്നങ്ങൾ ലഭ്യമാണ്?",
        "ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ",
      ],
      responses: {
        marketplace: "ഞങ്ങളുടെ മാർക്കറ്റ്പ്ലേസിൽ കോഴിക്കോട്ടിൽ നിന്നുള്ള ആധികാരിക ഉൽപ്പന്നങ്ങൾ ഉണ്ട്: സ്നാക്ക്സ്, അച്ചാറുകൾ, കരകൗശലവസ്തുക്കൾ, എംബ്രോയ്ഡറി, സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ. കണ്ടെത്താൻ 'Marketplace' ക്ലിക്ക് ചെയ്യൂ!",
        seller: "നിങ്ങൾ ഒരു വിൽപ്പനക്കാരനാകുന്നത് ഞങ്ങൾക്ക് സന്തോഷമാണ്! ആനുകൂല്യങ്ങളെക്കുറിച്ച് അറിയാനും ഞങ്ങളുടെ ലളിതമായ ഓൺബോർഡിംഗ് ഫോം പൂരിപ്പിക്കാനും 'Become a Seller' ക്ലിക്ക് ചെയ്യൂ.",
        product: "കോഴിക്കോട് കരകൗശല വിദഗ്ധരിൽ നിന്നുള്ള പരമ്പരാഗത സ്നാക്ക്സ്, ആധികാരിക അച്ചാറുകൾ, കൈകൊണ്ട് നിർമ്മിച്ച വസ്തുക്കൾ, മനോഹരമായ എംബ്രോയ്ഡറി വർക്ക്, പ്രകൃതിദത്ത സൗന്ദര്യ ഉൽപ്പന്നങ്ങൾ എന്നിവ ഞങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നു.",
        contact: "നിങ്ങൾക്ക് ഞങ്ങളെ saumaya16@iimk.edu.in എന്ന വിലാസത്തിൽ ബന്ധപ്പെടാം അല്ലെങ്കിൽ Instagram-ൽ @kozhikodereconnect ഫോളോ ചെയ്യാം. കൂടുതൽ വിവരങ്ങൾക്ക് ഞങ്ങളുടെ Contact പേജ് സന്ദർശിക്കൂ!",
        default: "നിങ്ങളുടെ സന്ദേശത്തിന് നന്ദി. ഞങ്ങളുടെ ടീം ഉടൻ നിങ്ങളെ ബന്ധപ്പെടും!",
      }
    }
  };

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ml' : 'en';
    setLanguage(newLang);

    // Update the initial greeting message
    setMessages([{
      id: 1,
      text: translations[newLang].greeting,
      sender: 'bot',
    }]);
  };

  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let botResponse = t.responses.default;
      const textLower = text.toLowerCase();

      // Check for keywords in both English and Malayalam
      if (textLower.includes('marketplace') || textLower.includes('മാർക്കറ്റ്')) {
        botResponse = t.responses.marketplace;
      } else if (textLower.includes('seller') || textLower.includes('sell') || textLower.includes('വിൽപ്പന')) {
        botResponse = t.responses.seller;
      } else if (textLower.includes('contact') || textLower.includes('ബന്ധപ്പെട')) {
        botResponse = t.responses.contact;
      } else if (textLower.includes('product') || textLower.includes('item') || textLower.includes('available') || textLower.includes('ഉൽപ്പന്ന') || textLower.includes('what')) {
        // Dynamic Product Search
        try {
          // Use the API URL from environment or empty string for relative path (proxy)
          const API_URL = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${API_URL}/catalog/search`);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const itemsList = data.items.slice(0, 4).map((item: any) => `• ${item.name} (₹${item.price})`).join('\n');
            const moreCount = data.items.length > 4 ? `\n...and ${data.items.length - 4} more!` : '';
            botResponse = `Here are some of our available products:\n${itemsList}${moreCount}\n\nYou can search for specific items like "halwa" or "chips" in the search bar!`;
          } else {
            botResponse = t.responses.product; // Fallback if no items found
          }
        } catch (error) {
          console.error("Failed to fetch products for chat:", error);
          botResponse = t.responses.product; // Fallback on error
        }
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-card border border-border rounded-lg shadow-2xl w-[90vw] sm:w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>{t.chatTitle}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                title={language === 'en' ? 'മലയാളം' : 'English'}
              >
                <Globe className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                    }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">{t.quickQuestions}</p>
              <div className="flex flex-wrap gap-2">
                {t.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
