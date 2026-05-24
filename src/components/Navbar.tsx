import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const navLinks = [
{
  name: 'Home',
  href: '#home'
},
{
  name: 'About',
  href: '#about'
},
{
  name: 'Skills',
  href: '#skills'
},
{
  name: 'Projects',
  href: '#projects'
},
{
  name: 'AI Assistant',
  href: '#ai-assistant'
},
{
  name: 'Journey',
  href: '#journey'
},
{
  name: 'Contact',
  href: '#contact'
}];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <img
              src="/my-photo.jpg"
              alt="Nuwanaka Nadil"
              className="h-full w-full rounded-xl object-cover object-center"
            />
          </div>
          <span className="font-bold text-lg hidden sm:block group-hover:text-primary transition-colors">
            Nuwanaka Nadil
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) =>
          <a
            key={link.name}
            href={link.href}
            className="text-sm font-medium text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
            
              <span className="text-primary/50 font-mono text-xs">{`0${i + 1}.`}</span>
              {link.name}
            </a>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="absolute top-full left-0 right-0 bg-surface border-b border-white/10 shadow-2xl md:hidden">
          
            <nav className="flex flex-col p-6 gap-4">
              {navLinks.map((link, i) =>
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-300 hover:text-primary transition-colors flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
              
                  <span className="text-primary font-mono text-sm">{`0${i + 1}.`}</span>
                  {link.name}
                </a>
            )}
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}