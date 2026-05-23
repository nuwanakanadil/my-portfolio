import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Github, ExternalLink, FolderGit2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { MacWindowControls } from './MacWindowControls';

const projects = [
  {
    title: 'BidMaster',
    label: 'Featured build',
    description: 'An online auction system designed around users, listings, bids, authentication, and database-backed workflows.',
    problem: 'Creating a practical platform where users can list items, place bids, and manage auction activity.',
    impact: 'Shows backend thinking, CRUD flows, database design, authentication, and full web application structure.',
    tech: ['PHP', 'MySQL', 'Web App', 'Authentication'],
    github: 'https://github.com/nuwanakanadil',
    demo: '#',
  },
  {
    title: 'PDF-Site',
    label: 'TypeScript project',
    description: 'A TypeScript-based web project focused on PDF-related features and a cleaner frontend development workflow.',
    problem: 'Building a focused utility-style project while practicing stronger type safety and modern web structure.',
    impact: 'Highlights TypeScript usage, frontend organization, and learning through practical feature implementation.',
    tech: ['TypeScript', 'Frontend', 'PDF Tools'],
    github: 'https://github.com/nuwanakanadil',
    demo: '#',
  },
  {
    title: '2YS2',
    label: 'JavaScript practice',
    description: 'A JavaScript project that reflects hands-on practice with logic, browser behavior, and web fundamentals.',
    problem: 'Strengthening core programming logic through smaller, focused implementation exercises.',
    impact: 'Demonstrates consistency, experimentation, and comfort with JavaScript fundamentals.',
    tech: ['JavaScript', 'DOM', 'Web Basics'],
    github: 'https://github.com/nuwanakanadil',
    demo: '#',
  },
  {
    title: 'Demo / Lab Work',
    label: 'Learning archive',
    description: 'A collection of experiments, coursework, and implementation practice across software engineering concepts.',
    problem: 'Turning classroom knowledge and self-learning into actual working code.',
    impact: 'Shows active learning, iteration, and a habit of building instead of only studying theory.',
    tech: ['TypeScript', 'Java', 'Practice'],
    github: 'https://github.com/nuwanakanadil',
    demo: '#',
  },
];

export function Projects() {
  const [activeProject, setActiveProject] = useState(projects[0]);

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="03" title="Featured Projects" />

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28 rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <MacWindowControls />
                <span className="text-xs font-mono text-gray-500">project-story.tsx</span>
              </div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-mono text-primary">
                <CheckCircle2 size={15} /> Project story
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">{activeProject.title}</h3>
              <p className="text-gray-400 leading-7 mb-6">{activeProject.description}</p>

              <div className="space-y-4">
                <div className="rounded-2xl bg-background border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-widest font-mono text-primary mb-2">Problem</p>
                  <p className="text-gray-300 leading-6">{activeProject.problem}</p>
                </div>
                <div className="rounded-2xl bg-background border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-widest font-mono text-primary mb-2">What it proves</p>
                  <p className="text-gray-300 leading-6">{activeProject.impact}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {activeProject.tech.map((tech) => (
                  <span key={tech} className="text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={activeProject.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primaryHover transition-all hover-glow">
                  <Github size={18} /> View code
                </a>
                <a href={activeProject.demo} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold hover:border-primary/50 transition-all">
                  <ExternalLink size={18} /> Demo soon
                </a>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <motion.button
                type="button"
                key={project.title}
                onClick={() => setActiveProject(project)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`group text-left relative bg-surface border rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300 hover-glow ${
                  activeProject.title === project.title ? 'border-primary/60' : 'border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FolderGit2 size={26} />
                  </div>
                  <ArrowUpRight size={22} className="text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs uppercase tracking-widest font-mono text-primary/70 mb-3">{project.label}</p>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-gray-400 leading-7 mb-6">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-xs font-mono text-gray-300 bg-background px-3 py-1 rounded-full border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
