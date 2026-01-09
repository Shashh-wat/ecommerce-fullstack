import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import saumayaPhoto from 'figma:asset/292ee1392d19f85281d7d41e5c8ded255ff6c44e.png';
import kozhikodeCollage from 'figma:asset/361787eed9f2a2d235d24f4b5259c2b2c2b45673.png';

export const introSlides = [
  {
    id: 0,
    title: "Kozhikode",
    subtitle: "A land of legendary flavors, timeless crafts, and deep cultural heritage",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12 px-8 relative overflow-hidden">
        {/* Background Image with Blur Effect */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${kozhikodeCollage})`,
              filter: 'blur(3px) brightness(0.7)',
            }}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { emoji: '🌴', x: '10%', y: '20%', delay: 0 },
            { emoji: '🥥', x: '85%', y: '15%', delay: 0.2 },
            { emoji: '🌶️', x: '15%', y: '70%', delay: 0.4 },
            { emoji: '🏺', x: '80%', y: '75%', delay: 0.6 },
            { emoji: '🛥️', x: '50%', y: '10%', delay: 0.8 },
            { emoji: '🧵', x: '90%', y: '45%', delay: 1.0 }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl opacity-20"
              style={{ left: item.x, top: item.y }}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                opacity: 0.2,
              }}
              transition={{ 
                delay: item.delay, 
                duration: 1,
                type: "spring"
              }}
            >
              <motion.span
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 4,
                  delay: item.delay + 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {item.emoji}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          className="text-center space-y-8 relative z-10 max-w-4xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Heritage Icons Row */}
          <motion.div 
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {['🌾', '🎨', '🍛', '🧺', '⛵'].map((emoji, i) => (
              <motion.div
                key={i}
                className="text-5xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.7 + i * 0.1,
                  type: "spring",
                  bounce: 0.6
                }}
                whileHover={{ scale: 1.3, rotate: 360 }}
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>

          <motion.h1
            className="text-7xl font-bold text-white drop-shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Welcome to Kozhikode
          </motion.h1>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <p className="text-3xl text-white/90 drop-shadow-lg">
              A land of <motion.span 
                className="text-orange-400 font-semibold drop-shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                legendary flavors
              </motion.span>
            </p>
            <p className="text-3xl text-white/90 drop-shadow-lg">
              <motion.span 
                className="text-amber-400 font-semibold drop-shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
              >
                timeless crafts
              </motion.span>, and deep <motion.span 
                className="text-green-400 font-semibold drop-shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity }}
              >
                cultural heritage
              </motion.span>
            </p>
          </motion.div>

          {/* Founder Introduction */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-muted"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                boxShadow: [
                  "0 0 0px rgba(249, 115, 22, 0)",
                  "0 0 30px rgba(249, 115, 22, 0.6)",
                  "0 0 0px rgba(249, 115, 22, 0)"
                ]
              }}
              transition={{
                boxShadow: { duration: 3, repeat: Infinity }
              }}
            >
              <img
                src={saumayaPhoto}
                alt="Saumaya"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="text-left">
              <p className="text-2xl font-semibold text-white drop-shadow-lg">Hi, I'm Saumaya</p>
              <motion.p 
                className="text-xl text-orange-400 font-semibold drop-shadow-lg"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                I invite you to rediscover our roots
              </motion.p>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative Bottom Wave */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/10 to-transparent"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        />
      </div>
    ),
    background: "bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-green-950/20"
  },
  {
    id: 1,
    title: "The Challenge",
    subtitle: "Hidden talent, limited reach",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12 px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: '👵', label: 'Homemakers', color: 'from-pink-500 to-rose-500' },
            { icon: '🎨', label: 'Artisans', color: 'from-orange-500 to-amber-500' },
            { icon: '👴', label: 'Senior Citizens', color: 'from-blue-500 to-indigo-500' }
          ].map((person, i) => (
            <motion.div
              key={person.label}
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
            >
              <motion.div
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-6xl shadow-xl`}
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {person.icon}
              </motion.div>
              <p className="text-xl font-semibold">{person.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="max-w-3xl text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.p
            className="text-3xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            Today, thousands of our skilled community members possess{' '}
            <span className="text-primary font-semibold">incredible talent</span>...
          </motion.p>
        </motion.div>

        {/* Digital Divide Visualization */}
        <motion.div
          className="relative w-full max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <div className="flex items-center justify-between gap-8">
            {/* Talent Side */}
            <motion.div
              className="flex-1 bg-card border-2 border-green-500 rounded-xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-2">✨</div>
              <p className="font-semibold text-green-600">Amazing Skills</p>
            </motion.div>

            {/* Gap */}
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-5xl">⚠️</div>
              <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-red-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Digital Gap
              </motion.div>
            </motion.div>

            {/* Market Side */}
            <motion.div
              className="flex-1 bg-card border-2 border-red-500 border-dashed rounded-xl p-6 text-center opacity-50"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-2">🌍</div>
              <p className="font-semibold text-muted-foreground">Global Reach</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
        >
          <motion.p 
            className="text-4xl font-bold text-red-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Yet, they lack the digital access to share it with the world
          </motion.p>
        </motion.div>
      </div>
    ),
    background: "bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20"
  },
  {
    id: 2,
    title: "The Opportunity",
    subtitle: "A global community searching for authentic connections",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12 px-8 relative">
        {/* Animated Globe */}
        <motion.div
          className="relative w-64 h-64 mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-500 shadow-2xl flex items-center justify-center text-8xl"
            animate={{ 
              rotate: [0, 360],
              boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 60px rgba(59, 130, 246, 0.8)",
                "0 0 0px rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 3, repeat: Infinity }
            }}
          >
            🌍
          </motion.div>

          {/* Orbiting Icons - Expats/Buyers */}
          {[
            { emoji: '✈️', angle: 0, delay: 0, radius: 150 },
            { emoji: '👨‍💼', angle: 120, delay: 0.3, radius: 150 },
            { emoji: '👩‍💻', angle: 240, delay: 0.6, radius: 150 }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-32px',
                marginLeft: '-32px',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              transition={{ 
                opacity: { delay: 0.5 + item.delay },
                scale: { delay: 0.5 + item.delay },
              }}
            >
              <motion.div
                className="w-16 h-16"
                animate={{
                  x: Math.cos((item.angle + 90) * Math.PI / 180) * item.radius - 32,
                  y: Math.sin((item.angle + 90) * Math.PI / 180) * item.radius - 32,
                  rotate: [0, 360]
                }}
                transition={{
                  x: { duration: 8, repeat: Infinity, ease: "linear", delay: item.delay },
                  y: { duration: 8, repeat: Infinity, ease: "linear", delay: item.delay },
                  rotate: { duration: 8, repeat: Infinity, ease: "linear", delay: item.delay }
                }}
              >
                <motion.div
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: item.delay }}
                >
                  {item.emoji}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Message */}
        <motion.div
          className="max-w-4xl text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.p
            className="text-4xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Meanwhile, <motion.span 
              className="text-blue-600 font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              returning expatriates
            </motion.span>
          </motion.p>
          <motion.p
            className="text-4xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            and <motion.span 
              className="text-green-600 font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
            >
              global buyers
            </motion.span> are searching...
          </motion.p>
        </motion.div>

        {/* Search Items Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          {[
            { icon: '🌿', label: 'Authentic', color: 'from-green-500 to-emerald-500' },
            { icon: '♻️', label: 'Sustainable', color: 'from-blue-500 to-cyan-500' },
            { icon: '🏡', label: 'Homemade', color: 'from-orange-500 to-amber-500' },
            { icon: '💚', label: 'Reconnect', color: 'from-pink-500 to-rose-500' }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className={`bg-gradient-to-br ${item.color} text-white rounded-xl p-6 text-center shadow-lg`}
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                delay: 2 + i * 0.15,
                type: "spring",
                bounce: 0.5
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <motion.div 
                className="text-5xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
              >
                {item.icon}
              </motion.div>
              <p className="font-semibold text-lg">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        >
          <motion.p 
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ...to reconnect with home
          </motion.p>
        </motion.div>
      </div>
    ),
    background: "bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950/20 dark:via-green-950/20 dark:to-cyan-950/20"
  },
  {
    id: 3,
    title: "The Solution",
    subtitle: "Bridging tradition with technology",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12 px-8">
        {/* Brand Icon */}
        <motion.div
          className="text-9xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5 }}
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 0px rgba(249, 115, 22, 0))",
                "drop-shadow(0 0 40px rgba(249, 115, 22, 0.8))",
                "drop-shadow(0 0 0px rgba(249, 115, 22, 0))"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌴
          </motion.div>
        </motion.div>

        {/* Title Reveal */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.p
            className="text-3xl text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            Introducing
          </motion.p>
          <motion.h1
            className="text-7xl font-bold bg-gradient-to-r from-primary via-orange-600 to-amber-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.9, duration: 0.6, type: "spring" }}
          >
            Kozhikode Reconnect
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          >
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-primary to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            />
            <motion.p
              className="text-2xl font-semibold text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              A Digital Revival Hub
            </motion.p>
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-orange-600 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            />
          </motion.div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          {[
            { 
              icon: '🌏', 
              title: 'Bilingual Marketplace',
              desc: 'Malayalam & English',
              color: 'from-blue-500 to-indigo-500'
            },
            { 
              icon: '🤝', 
              title: 'Bridges Tradition',
              desc: 'Heritage meets innovation',
              color: 'from-orange-500 to-amber-500'
            },
            { 
              icon: '💻', 
              title: 'With Technology',
              desc: 'Digital empowerment',
              color: 'from-green-500 to-emerald-500'
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative bg-card border-2 rounded-xl p-6 text-center overflow-hidden group"
              initial={{ opacity: 0, y: 30, rotateY: -30 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                delay: 2.7 + i * 0.2,
                duration: 0.6,
                type: "spring"
              }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
              
              <motion.div
                className="text-6xl mb-4 relative z-10"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity
                }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-2 relative z-10">{feature.title}</h3>
              <p className="text-muted-foreground relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <motion.div
            className="inline-block bg-gradient-to-r from-primary/10 via-orange-500/10 to-amber-500/10 border-2 border-primary/30 rounded-full px-8 py-4"
            animate={{
              boxShadow: [
                "0 0 0px rgba(249, 115, 22, 0)",
                "0 0 30px rgba(249, 115, 22, 0.4)",
                "0 0 0px rgba(249, 115, 22, 0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-2xl font-bold bg-gradient-to-r from-primary via-orange-600 to-amber-600 bg-clip-text text-transparent">
              Where Tradition Meets Technology
            </p>
          </motion.div>
        </motion.div>
      </div>
    ),
    background: "bg-gradient-to-br from-primary/5 via-orange-500/5 to-amber-500/5"
  }
];