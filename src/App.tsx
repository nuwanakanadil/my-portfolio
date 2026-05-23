import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { AIPortfolioAssistant } from './components/AIPortfolioAssistant';
import { Journey } from './components/Journey';
import { Activity } from './components/Activity';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
export function App() {
  return (
    <div className="min-h-screen bg-background text-gray-300 font-sans selection:bg-primary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <AIPortfolioAssistant />
        <Journey />
        <Activity />
        <Contact />
      </main>
      <Footer />
    </div>);

}