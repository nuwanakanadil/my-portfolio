import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Braces, Database, GitBranch, Layout, Server, Wrench } from 'lucide-react';

const skillCategories = [
  {
    icon: <Braces size={22} />,
    title: 'Languages',
    description: 'Programming foundations and day-to-day implementation.',
    skills: ['Java', 'PHP', 'JavaScript', 'TypeScript'],
  },
  {
    icon: <Layout size={22} />,
    title: 'Frontend',
    description: 'Building responsive, usable interfaces for web applications.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'React Basics'],
  },
  {
    icon: <Server size={22} />,
    title: 'Backend',
    description: 'Server logic, application structure, and practical systems.',
    skills: ['PHP', 'Laravel', 'Java', 'REST Basics'],
  },
  {
    icon: <Database size={22} />,
    title: 'Databases',
    description: 'Designing tables, relationships, and application data flows.',
    skills: ['MySQL', 'Schema Design', 'CRUD', 'Queries'],
  },
  {
    icon: <GitBranch size={22} />,
    title: 'Tools',
    description: 'Development workflow, version control, and debugging tools.',
    skills: ['Git', 'GitHub', 'VS Code', 'Postman'],
  },
  {
    icon: <Wrench size={22} />,
    title: 'Currently Improving',
    description: 'The technologies I am actively strengthening right now.',
    skills: ['Laravel', 'Vue.js', 'APIs', 'Clean Code'],
  },
];

export function Skills() {
  return (
    <section id="skills" className="py-24 relative bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="02" title="Technical Toolkit" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, i) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-surface border border-white/5 rounded-2xl p-7 hover:border-primary/30 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all" />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-white/10 text-primary group-hover:border-primary/50 transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500 leading-6 mb-6">{category.description}</p>

                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span key={skill} className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm font-mono text-gray-300 hover:border-primary hover:text-primary transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
