import React from 'react';
import { motion } from 'framer-motion';
interface SectionHeadingProps {
  number: string;
  title: string;
}
export function SectionHeading({ number, title }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true,
        margin: '-100px'
      }}
      className="flex items-center gap-4 mb-12">
      
      <h2 className="text-3xl md:text-4xl font-bold flex items-baseline gap-3">
        <span className="text-primary font-mono text-xl md:text-2xl font-normal">
          {number}.
        </span>
        {title}
      </h2>
      <div className="h-px bg-white/10 flex-grow max-w-xs ml-4" />
    </motion.div>);

}