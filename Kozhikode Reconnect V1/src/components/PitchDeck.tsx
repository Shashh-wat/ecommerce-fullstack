import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Users, Heart, Mail, MapPin, X, Sparkles, Lock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from 'figma:asset/87183293a5c198aa01fb692c1d2fbacd986e5d3d.png';
import { introSlides } from './PitchIntroSlides';
import saumayaPhoto from 'figma:asset/292ee1392d19f85281d7d41e5c8ded255ff6c44e.png';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  background: string;
}

interface PitchDeckProps {
  onExit?: () => void;
}

export function PitchDeck({ onExit }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const slides: Slide[] = [
    ...introSlides,
    {
      id: 4,
      title: "More Than a Marketplace",
      subtitle: "A Movement for Change",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-12 px-8 relative">
          {/* Main headline */}
          <motion.div
            className="max-w-5xl text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-3xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              We aren't just a marketplace;
            </motion.p>
            <motion.h1
              className="text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              We are a Movement
            </motion.h1>
          </motion.div>

          {/* Three pillars */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {[
              {
                icon: '👩',
                title: 'Empowering Women',
                desc: 'Creating economic independence',
                color: 'from-pink-500 to-rose-500',
                emoji: '💪'
              },
              {
                icon: '👴',
                title: 'Supporting Seniors',
                desc: 'Honoring experience & wisdom',
                color: 'from-blue-500 to-indigo-500',
                emoji: '❤️'
              },
              {
                icon: '✈️',
                title: 'Rebuilding Livelihoods',
                desc: 'For returning expats',
                color: 'from-green-500 to-emerald-500',
                emoji: '🏡'
              }
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="relative bg-card border-2 rounded-2xl p-8 text-center overflow-hidden group"
                initial={{ opacity: 0, y: 50, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  delay: 1.2 + i * 0.2,
                  duration: 0.6,
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                {/* Gradient background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-5 group-hover:opacity-15 transition-opacity duration-300`}
                />

                {/* Main Icon */}
                <motion.div
                  className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${pillar.color} flex items-center justify-center text-5xl shadow-xl relative z-10`}
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {pillar.icon}
                </motion.div>

                {/* Title */}
                <motion.h3 
                  className="text-2xl font-bold mb-3 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 + i * 0.2 }}
                >
                  {pillar.title}
                </motion.h3>

                {/* Description */}
                <motion.p 
                  className="text-lg text-muted-foreground mb-4 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 + i * 0.2 }}
                >
                  {pillar.desc}
                </motion.p>

                {/* Floating emoji */}
                <motion.div
                  className="text-4xl absolute top-4 right-4 opacity-20"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    delay: i * 0.5,
                    repeat: Infinity
                  }}
                >
                  {pillar.emoji}
                </motion.div>

                {/* Pulse effect */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${pillar.color}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0, 0.1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: 2 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom message */}
          <motion.div
            className="text-center max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <motion.div
              className="inline-block bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/30 rounded-full px-10 py-4"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(168, 85, 247, 0)",
                  "0 0 40px rgba(168, 85, 247, 0.5)",
                  "0 0 0px rgba(168, 85, 247, 0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Building Communities, Changing Lives
              </p>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  scale: [0, 1, 0],
                  y: [0, -50, -100]
                }}
                transition={{
                  duration: 4,
                  delay: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
              >
                {['✨', '💫', '⭐', '🌟', '💖'][i % 5]}
              </motion.div>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20"
    },
    {
      id: 5,
      title: "Kozhikode Reconnect",
      subtitle: "Live Marketplace Platform",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
          {/* Browser Mockup */}
          <motion.div
            className="w-full max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            {/* Browser Chrome */}
            <motion.div 
              className="bg-card border rounded-t-xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Browser Top Bar */}
              <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-500"
                    whileHover={{ scale: 1.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-yellow-500"
                    whileHover={{ scale: 1.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-green-500"
                    whileHover={{ scale: 1.3 }}
                  />
                </div>
                
                {/* Address Bar */}
                <motion.div 
                  className="flex-1 bg-background border rounded-lg px-4 py-2 flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Lock className="w-4 h-4 text-green-600" />
                  <motion.div
                    className="flex-1 font-mono text-sm"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <span className="text-muted-foreground">https://</span>
                    <span className="font-semibold text-primary">kozhikodereconnect.org</span>
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Website Content */}
              <motion.div 
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {/* Hero Section Preview */}
                <div className="relative">
                  <motion.div
                    className="relative h-96 overflow-hidden"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    {/* Hero Image with Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
                    <motion.img
                      src={heroImage}
                      alt="Kozhikode Marketplace"
                      className="w-full h-full object-cover"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Hero Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                        className="max-w-2xl"
                      >
                        <motion.h1
                          className="text-5xl font-bold text-white mb-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4 }}
                        >
                          Revival Hub
                        </motion.h1>
                        
                        <motion.p
                          className="text-xl text-white/90 mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6 }}
                        >
                          Rediscover authentic flavors, crafts, and traditions
                        </motion.p>
                        
                        {/* CTA Buttons */}
                        <motion.div
                          className="flex gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.8 }}
                        >
                          <motion.div
                            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            animate={{
                              boxShadow: [
                                "0 0 0px rgba(var(--primary), 0)",
                                "0 0 20px rgba(var(--primary), 0.5)",
                                "0 0 0px rgba(var(--primary), 0)"
                              ]
                            }}
                            transition={{
                              boxShadow: { duration: 2, repeat: Infinity }
                            }}
                          >
                            Explore Marketplace
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                          
                          <motion.div
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                            whileHover={{ scale: 1.05 }}
                          >
                            Join as Seller
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Quick Feature Cards - Peek */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-32"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      {[
                        { icon: ShoppingBag, label: 'Authentic Products' },
                        { icon: Users, label: 'Community Driven' },
                        { icon: Heart, label: 'Cultural Heritage' }
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.label}
                            className="bg-card/90 backdrop-blur border rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.2 + i * 0.1 }}
                            whileHover={{ y: -5 }}
                          >
                            <Icon className="w-4 h-4 text-primary" />
                            <span>{item.label}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Browser Shadow */}
            <div className="h-4 bg-gradient-to-b from-black/10 to-transparent" />
          </motion.div>
          
          {/* Floating Stats */}
          <motion.div
            className="flex gap-6 items-center flex-wrap justify-center max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            {[
              { icon: '🎨', label: 'Empowering Local Artisans', color: 'text-orange-600', gradient: 'from-orange-500 to-amber-600' },
              { icon: '🌾', label: 'Preserving Kerala Heritage', color: 'text-green-600', gradient: 'from-green-500 to-emerald-600' },
              { icon: '💚', label: 'Connecting Communities', color: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 px-6 py-3 bg-card border-2 rounded-full shadow-lg relative overflow-hidden group"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.7 + i * 0.15, type: "spring", bounce: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                <motion.span 
                  className="text-3xl relative z-10"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {stat.icon}
                </motion.span>
                <span className={`font-semibold text-base relative z-10 ${stat.color}`}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Tagline */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2 }}
          >
            <motion.p 
              className="text-2xl font-semibold bg-gradient-to-r from-primary via-orange-600 to-amber-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% auto'
              }}
            >
              Where Tradition Meets Future
            </motion.p>
          </motion.div>
        </div>
      ),
      background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950/20 dark:via-blue-950/20 dark:to-indigo-950/20"
    },
    {
      id: 6,
      title: "The Challenge",
      subtitle: "Local artisans struggle to reach beyond their neighborhood",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-12 px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-8xl"
          >
            🎨
          </motion.div>
          <div className="max-w-3xl text-center space-y-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl text-muted-foreground"
            >
              In Kozhikode, talented artisans create amazing handcrafted products
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-4xl font-semibold text-primary"
            >
              But they lack access to wider markets
            </motion.p>
          </div>
          
          {/* Floating icons animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  y: [-100, -500],
                  x: [0, (i % 2 === 0 ? 50 : -50)]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="absolute text-4xl"
                style={{ left: `${15 + i * 15}%`, bottom: 0 }}
              >
                {['🏺', '🧺', '🥥', '🌶️', '🎨', '👔'][i]}
              </motion.div>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
    },
    {
      id: 7,
      title: "Our Team",
      subtitle: "IIM Kozhikode students building for our community",
      content: (
        <div className="flex items-center justify-center h-full px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
            {[
              { name: 'Saumaya', role: 'Founder & CEO', detail: 'Vision & Strategy', initial: 'S', color: 'from-primary to-orange-600' },
              { name: 'Ashish Sagar', role: 'Community Manager', detail: 'Seller Relations', initial: 'A', color: 'from-green-600 to-emerald-600' },
              { name: 'Lamees', role: 'Head of Marketplace', detail: 'Operations & Growth', initial: 'L', color: 'from-blue-600 to-indigo-600' }
            ].map((member, i) => (
              <motion.div
                key={member.name}
                className="flex flex-col items-center text-center space-y-4 group"
                initial={{ opacity: 0, y: 50, rotateY: -90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <motion.div 
                  className={`w-32 h-32 rounded-full ${member.name === 'Saumaya' ? '' : `bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-5xl font-bold`} relative overflow-hidden shadow-xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {member.name === 'Saumaya' ? (
                    <img
                      src={saumayaPhoto}
                      alt="Saumaya"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    member.initial
                  )}
                  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.3 }}
                >
                  <motion.h3 
                    className="text-2xl font-semibold"
                    whileHover={{ scale: 1.05 }}
                  >
                    {member.name}
                  </motion.h3>
                  <motion.p 
                    className="text-primary font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 + 0.4 }}
                  >
                    {member.role}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 + 0.5 }}
                  >
                    {member.detail}
                  </motion.p>
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2 + 0.6, type: "spring" }}
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                  IIM-K
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20"
    },
    {
      id: 8,
      title: "Join Us",
      subtitle: "Let's reconnect Kozhikode's economy together",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-12 px-8">
          <motion.div 
            className="text-9xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.6 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                filter: [
                  "drop-shadow(0 0 0px rgba(249, 115, 22, 0))", 
                  "drop-shadow(0 0 30px rgba(249, 115, 22, 0.6))", 
                  "drop-shadow(0 0 0px rgba(249, 115, 22, 0))"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌴
            </motion.div>
          </motion.div>
          
          <div className="max-w-2xl text-center space-y-8">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl font-bold bg-gradient-to-r from-primary via-orange-600 to-amber-600 bg-clip-text text-transparent"
            >
              Empowering Local Commerce
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-2xl text-muted-foreground"
            >
              Supporting Kerala's artisans, one product at a time
            </motion.p>
          </div>
          
          <motion.div 
            className="flex flex-col gap-4 text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <motion.div 
              className="flex items-center gap-3 bg-card/50 backdrop-blur px-6 py-3 rounded-full border border-primary/20"
              whileHover={{ scale: 1.05, borderColor: 'rgb(var(--primary))' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Mail className="w-5 h-5 text-primary" />
              <span>hello@kozhikodereconnect.com</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 bg-card/50 backdrop-blur px-6 py-3 rounded-full border border-primary/20"
              whileHover={{ scale: 1.05, borderColor: 'rgb(var(--primary))' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MapPin className="w-5 h-5 text-primary" />
              <span>IIM Kozhikode Campus</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Founded 2025 • IIM Kozhikode
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>

          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-10%'
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  rotate: [0, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>
        </div>
      ),
      background: "bg-gradient-to-br from-primary/5 via-orange-500/5 to-amber-500/5"
    }
  ];

  const goToSlide = (index: number, dir: 'forward' | 'backward' = 'forward') => {
    if (index >= 0 && index < slides.length) {
      setDirection(dir);
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1, 'forward');
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1, 'backward');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0, 'backward');
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(slides.length - 1, 'forward');
      } else if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, onExit]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Exit button */}
      {onExit && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50"
          onClick={onExit}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Slide indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index, index > currentSlide ? 'forward' : 'backward')}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ 
            opacity: 0,
            x: direction === 'forward' ? 1000 : -1000
          }}
          animate={{ 
            opacity: 1,
            x: 0
          }}
          exit={{ 
            opacity: 0,
            x: direction === 'forward' ? -1000 : 1000
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className={`h-full ${currentSlideData.background}`}
        >
          {currentSlideData.content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons - REMOVED for clean presentation recording */}
      {/* Users can navigate with arrow keys */}

      {/* Slide title at bottom - Hidden to prevent overlay with slide content */}
    </div>
  );
}