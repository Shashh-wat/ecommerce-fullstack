import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Globe, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../utils/AuthContext';
import { GeminiLiveClient } from '../utils/geminiLiveClient';

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

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const voiceClientRef = useRef<GeminiLiveClient | null>(null);

  const translations: Record<Language, {
    chatTitle: string;
    placeholder: string;
    quickQuestions: string;
    greeting: string;
    quickReplies: string[];
    responses: {
      marketplace: string;
      seller: string;
      product: string;
      contact: string;
      default: string;
    };
  }> = {
    en: {
      chatTitle: "Chat with us",
      placeholder: "Type your message...",
      quickQuestions: "Quick questions:",
      greeting: "Hello! Welcome to Kozhikode Reconnect. How can I help you today?",
      quickReplies: [
        "Tell me about the marketplace",
        "How do I become a seller",
        "What products are available",
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
        "ഞാൻ എങ്ങനെ വിൽപ്പനക്കാരനാകും",
        "ഏതൊക്കെ ഉൽപ്പന്നങ്ങൾ ലഭ്യമാണ്",
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

  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize Session ID (User ID or Persistent Anonymous ID)
  useEffect(() => {
    if (user?.id) {
      setSessionId(user.id);
    } else {
      let storedId = localStorage.getItem('chat_anon_id');
      if (!storedId) {
        storedId = 'anon-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_anon_id', storedId);
      }
      setSessionId(storedId);
    }
  }, [user]);

  // Voice Toggle
  const toggleVoiceMode = async () => {
    if (isVoiceActive) {
      // Stop
      if (voiceClientRef.current) {
        await voiceClientRef.current.disconnect();
        voiceClientRef.current = null;
      }
      setIsVoiceActive(false);
    } else {
      // Start
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Gemini API Key missing (VITE_GEMINI_API_KEY)");
        return;
      }

      try {
        const client = new GeminiLiveClient(apiKey);
        await client.connect();
        await client.startAudioStream();
        voiceClientRef.current = client;
        setIsVoiceActive(true);
      } catch (err) {
        console.error("Failed to start voice:", err);
        alert("Failed to start voice mode. Check console.");
        setIsVoiceActive(false);
      }
    }
  };

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      if (voiceClientRef.current) {
        voiceClientRef.current.disconnect();
      }
    };
  }, []);

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
      const API_URL = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user_id: sessionId,
          context: {
            language,
            isAuthenticated: !!user
          }
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botResponse = data.response || t.responses.default;

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const botMessage: Message = {
        id: messages.length + 2,
        text: t.responses.default,
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
                  <p className="text-sm border-none whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isVoiceActive && (
              <div className="flex justify-center py-4">
                <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                  <Mic className="w-8 h-8 text-red-500" />
                  <span className="text-xs">Live Voice Active</span>
                </div>
              </div>
            )}
            {isTyping && !isVoiceActive && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && !isVoiceActive && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">{t.quickQuestions}</p>
              <div className="flex flex-wrap gap-2">
                {t.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    type="button"
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
              <Button
                type="button"
                variant={isVoiceActive ? "destructive" : "outline"}
                size="icon"
                onClick={toggleVoiceMode}
                title={isVoiceActive ? "Stop Voice" : "Start Voice (Gemini Live)"}
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isVoiceActive ? "Listening (Voice Mode)..." : t.placeholder}
                className="flex-1"
                disabled={isVoiceActive}
              />
              <Button type="submit" size="icon" disabled={isVoiceActive}>
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
