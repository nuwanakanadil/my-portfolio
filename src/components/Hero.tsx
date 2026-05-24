import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Code2,
  Github,
  Linkedin,
  MapPin,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { MacWindowControls } from './MacWindowControls';

const stats = [
  { label: 'Focus', value: 'Full-Stack Web' },
  { label: 'Learning', value: 'Laravel + Vue' },
  { label: 'Based in', value: 'Sri Lanka' },
];

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-20 right-0 w-[720px] h-[720px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-amber-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 border border-white/10 text-sm font-mono text-gray-300 mb-6 shadow-2xl backdrop-blur">
            <Terminal size={14} className="text-primary" />
            <span>nuwanaka@portfolio:~$ build --useful</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] mb-5">
            Building practical web apps with a{' '}
            <span className="text-gradient">backend-first mindset.</span>
          </h1>

          <p className="text-gray-300 text-xl sm:text-2xl font-medium mb-4">
            Hi, I’m <span className="text-white font-bold">Nuwanaka Nadil</span> — Software Engineering Undergraduate & Full-Stack Developer.
          </p>

          <p className="text-gray-400 text-lg max-w-2xl mb-8 leading-relaxed">
            I’m studying Software Engineering at SLIIT and improving my skills in Laravel, Vue.js, PHP, React, Angular, and database-driven systems. I enjoy turning ideas into clean, useful, and maintainable web applications.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <a href="#projects" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primaryHover transition-all hover-glow flex items-center gap-2">
              Explore Projects <ArrowRight size={18} />
            </a>
            <a href="https://github.com/nuwanakanadil" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-surface border border-white/10 text-white font-semibold hover:border-primary/50 hover:bg-white/5 transition-all flex items-center gap-2">
              <Github size={18} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/nuwanaka-nadil-9145442a5/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-surface border border-white/10 text-white font-semibold hover:border-primary/50 hover:bg-white/5 transition-all flex items-center gap-2">
              <Linkedin size={18} /> LinkedIn
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl bg-surface/70 border border-white/10 p-4 backdrop-blur hover:border-primary/30 transition-colors">
                <p className="text-xs font-mono text-gray-500 mb-1">{item.label}</p>
                <p className="text-white font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/25 blur-[90px] rounded-full transform scale-75" />

          <div className="relative rounded-[2rem] border border-white/10 bg-surface/80 p-5 shadow-2xl backdrop-blur overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative rounded-[1.5rem] bg-background border border-white/10 p-6 overflow-hidden">
              <div className="absolute right-0 top-0 h-40 w-40 bg-primary/20 blur-3xl" />

              <div className="flex items-center justify-between mb-8">
                <MacWindowControls />
                <span className="text-xs font-mono text-gray-500">profile.tsx</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-3xl bg-primary blur-2xl opacity-30" />
                  <div className="relative h-44 w-44 rounded-3xl bg-gradient-to-br from-primary to-amber-500 p-[2px] rotate-3">
                    <div className="h-full w-full rounded-[1.35rem] bg-background overflow-hidden -rotate-3">
                      <img
                        src="/my-photo.jpg"
                        alt="Nuwanaka Nadil"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white">Nuwanaka Nadil</h2>
                <p className="mt-2 text-gray-400">Software Engineering Undergraduate</p>
                <div className="mt-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  <MapPin size={15} className="text-primary" /> Gampaha, Sri Lanka
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-start gap-3">
                  <Code2 className="text-primary mt-1" size={20} />
                  <p className="text-sm leading-6 text-gray-400"><span className="text-white font-medium">Current stack:</span> Laravel, Vue.js, PHP, JavaScript, Java, MySQL.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-start gap-3">
                  <BadgeCheck className="text-primary mt-1" size={20} />
                  <p className="text-sm leading-6 text-gray-400"><span className="text-white font-medium">Looking for:</span> internship opportunities, junior projects, and real-world learning.</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-5 -left-3 sm:left-2 bg-surface border border-white/10 px-5 py-4 rounded-2xl shadow-xl z-20"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" size={20} />
              <div>
                <p className="text-sm font-mono text-gray-500">Status</p>
                <p className="font-semibold text-white">Open to internships</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
