import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Target, Code, Database, Rocket } from 'lucide-react';
const timeline = [
{
  icon: <Code size={20} />,
  title: 'Programming Fundamentals',
  desc: 'Started the journey by learning core programming concepts, algorithms, and object-oriented programming principles.'
},
{
  icon: <Database size={20} />,
  title: 'Building the Foundation',
  desc: 'Developed initial projects using Java, PHP, JavaScript, and TypeScript. Gained hands-on experience with databases and web technologies.'
},
{
  icon: <Target size={20} />,
  title: 'Current Focus',
  desc: 'Actively learning Laravel and Vue.js. Exploring full-stack development patterns, API design, and modern frontend frameworks.'
},
{
  icon: <Rocket size={20} />,
  title: 'The Goal',
  desc: 'To become a strong software engineer who builds useful, reliable, and scalable applications that solve real-world problems.'
}];

export function Journey() {
  return (
    <section id="journey" className="py-24 relative bg-surface/30">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading number="05" title="My Learning Journey" />

        <div className="relative mt-16">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-12">
            {timeline.map((item, i) =>
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: -20
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                delay: i * 0.1
              }}
              className="relative pl-20 md:pl-24">
              
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-2 top-1 w-12 h-12 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(249,115,22,0.3)] z-10">
                  {item.icon}
                </div>

                <div className="bg-surface border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}