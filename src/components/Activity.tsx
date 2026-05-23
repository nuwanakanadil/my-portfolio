import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Github, GitCommit, GitPullRequest, GitMerge, Flame } from 'lucide-react';

const cards = [
  { icon: <GitCommit size={24} />, title: 'Practice through code', text: 'I use GitHub as a record of experiments, coursework, and project progress.' },
  { icon: <GitPullRequest size={24} />, title: 'Builder mindset', text: 'I learn faster when I turn ideas into working interfaces, flows, and database-backed features.' },
  { icon: <GitMerge size={24} />, title: 'Full-stack direction', text: 'My current path connects frontend, backend, data, and deployment fundamentals.' },
];

export function Activity() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="06" title="Developer Activity" />

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-surface border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col justify-center relative overflow-hidden min-h-[360px]"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[90px]" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-mono text-primary">
                <Flame size={15} /> Current mindset
              </div>
              <Github size={58} className="text-white mb-6" />
              <h3 className="text-4xl font-bold text-white mb-4">Code. Learn. Build. Improve. Repeat.</h3>
              <p className="text-gray-400 leading-7 mb-8">
                My GitHub shows the direction I’m growing in: practical projects, learning experiments, and steady improvement across web development and software engineering fundamentals.
              </p>
              <a href="https://github.com/nuwanakanadil" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primaryHover transition-all hover-glow">
                <Github size={20} /> View GitHub Profile
              </a>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-white/5 p-6 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">{card.icon}</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{card.title}</h4>
                  <p className="text-sm leading-6 text-gray-400">{card.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
