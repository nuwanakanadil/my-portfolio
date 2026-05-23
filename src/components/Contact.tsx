import { useState, type FormEvent, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Mail, ExternalLink, Code2, Send, MessageSquare } from 'lucide-react';
import { MacWindowControls } from './MacWindowControls';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');

  let statusClass = 'text-gray-400';
  if (status.startsWith('Message sent')) {
    statusClass = 'text-emerald-400';
  } else if (status.startsWith('Please') || status.startsWith('Unable')) {
    statusClass = 'text-red-400';
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if (name === 'name') {
      setName(value);
      return;
    }

    if (name === 'email') {
      setEmail(value);
      return;
    }

    setMessage(value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus('Please fill out your name, email, and message.');
      return;
    }

    setIsSending(true);
    setStatus('Sending message...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message right now.');
      }

      setName('');
      setEmail('');
      setMessage('');
      setStatus('Message sent successfully. Check your inbox for a confirmation email.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to send message right now.';
      setStatus(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="07" title="Let’s Build Something" />

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-4xl font-bold text-white mb-6">Open to internships, projects, and learning opportunities.</h3>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Use this form to send me a message directly. I receive it in my inbox and can reply to your email address.
            </p>

            <div className="space-y-5">
              <a href="https://www.linkedin.com/in/nuwanaka-nadil-9145442a5/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-white/5 hover:border-primary/30 transition-colors group">
                <div className="p-3 rounded-lg bg-background text-gray-400 group-hover:text-primary transition-colors"><ExternalLink size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-mono">LinkedIn</p>
                  <p className="text-white font-medium">Connect with Nuwanaka Nadil</p>
                </div>
              </a>

              <a href="https://github.com/nuwanakanadil" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-white/5 hover:border-primary/30 transition-colors group">
                <div className="p-3 rounded-lg bg-background text-gray-400 group-hover:text-primary transition-colors"><Code2 size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-mono">GitHub</p>
                  <p className="text-white font-medium">github.com/nuwanakanadil</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-dashed border-white/10">
                <div className="p-3 rounded-lg bg-background text-gray-500"><Mail size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-mono">Email</p>
                  <p className="text-gray-400 font-medium">nuwanakanadil123@gmail.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <form className="relative space-y-6" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <MacWindowControls />
                <span className="text-xs font-mono text-gray-500">contact-form.tsx</span>
              </div>
              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">Send a message</h3>
                <p className="mt-2 text-gray-500 text-sm">Send this directly to the backend. If it is running, the message is accepted and logged server-side.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-mono text-gray-400 mb-2">Name</label>
                  <input type="text" id="name" name="name" value={name} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-mono text-gray-400 mb-2">Email</label>
                  <input type="email" id="email" name="email" value={email} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-mono text-gray-400 mb-2">Message</label>
                <textarea id="message" name="message" rows={6} value={message} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none" placeholder="Hello Nuwanaka, I’d like to talk about..." />
              </div>

              <p className={`min-h-6 text-sm ${statusClass}`} aria-live="polite">
                {status}
              </p>

              <button type="submit" disabled={isSending} className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primaryHover transition-all hover-glow flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70">
                {isSending ? 'Sending...' : 'Send Message'} <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
