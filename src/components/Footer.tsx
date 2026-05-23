import React from 'react';
export function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 bg-background text-center">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gray-500 font-mono text-sm">
          Designed & Built by Nuwanaka Nadil &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>);

}