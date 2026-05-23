import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { BookOpen, Code2, Server, Target } from 'lucide-react';

const highlights = [
  {
    icon: <BookOpen className="text-primary" size={24} />,
    title: 'Software Engineering Undergraduate',
    desc: 'Studying at SLIIT while building a practical foundation in programming, systems, and software design.',
  },
  {
    icon: <Code2 className="text-primary" size={24} />,
    title: 'Full-Stack Web Learner',
    desc: 'Learning how frontend experiences, backend logic, and databases connect inside real applications.',
  },
  {
    icon: <Server className="text-primary" size={24} />,
    title: 'Backend-Oriented Builder',
    desc: 'Interested in authentication, data flow, APIs, database structure, and reliable application behavior.',
  },
];

export function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="01" title="About Me" />

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-surface p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                I’m <span className="text-white font-semibold">Nuwanaka Nadil</span>, a Software Engineering undergraduate at SLIIT with a strong interest in building practical web applications that solve clear problems.
              </p>
              <p>
                My current focus is strengthening my full-stack skills, especially <span className="text-primary font-medium">Laravel, Vue.js, PHP, JavaScript, Java, and MySQL</span>. I like learning by building: creating projects, understanding mistakes, improving structure, and repeating the process.
              </p>
              <p>
                I’m not trying to present myself as finished. I’m building momentum — one project, one concept, and one better solution at a time.
              </p>

              <div className="pt-4 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-background border border-white/10 p-5">
                  <Target className="text-primary mb-3" size={22} />
                  <p className="font-mono text-sm text-gray-300">Currently seeking internship opportunities where I can learn, contribute, and grow in a real engineering environment.</p>
                </div>
                <div className="rounded-2xl bg-background border border-white/10 p-5">
                  <Code2 className="text-primary mb-3" size={22} />
                  <p className="font-mono text-sm text-gray-300">My goal is to become a reliable software engineer who builds useful, maintainable applications.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-background border border-white/10 group-hover:border-primary/50 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
