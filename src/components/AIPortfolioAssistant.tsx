import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import {
  ArrowUpRight,
  Bot,
  Brain,
  Briefcase,
  Code2,
  Github,
  Linkedin,
  MapPin,
  Send,
  Sparkles,
  Terminal,
  UserRound,
} from 'lucide-react';
import { MacWindowControls } from './MacWindowControls';

type AssistantMode = 'askAboutMe' | 'projectRecommender' | 'jobMatchHelper';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

type AssistantHealth = {
  provider: 'openai' | 'local-fallback';
  model: string;
};

const fallbackModelName = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini';

const portfolioData = {
  profile: {
    name: 'Nuwanaka Nadil',
    headline: 'Software Engineering Undergraduate',
    roleSummary: 'Software Engineer / Full Stack Developer / MERN Stack Developer / React Developer',
    university: 'SLIIT',
    location: 'Gampaha, Sri Lanka',
    learning: ['Laravel', 'Vue.js'],
    focusAreas: ['Web Development', 'Software Engineering', 'Backend Systems', 'Full-stack Development'],
  },
  skills: {
    frontend: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js'],
    backend: ['Java', 'PHP', 'Laravel', 'Backend basics', 'MERN stack learning'],
    database: ['MySQL', 'CRUD', 'Schema design'],
    tools: ['Git', 'GitHub', 'VS Code'],
    learning: ['Laravel', 'Vue.js', 'Full-stack patterns', 'APIs'],
  },
  links: {
    github: 'https://github.com/nuwanakanadil',
    linkedin: 'https://www.linkedin.com/in/nuwanaka-nadil-9145442a5/',
  },
  projects: [
    {
      title: 'BidMaster',
      label: 'Online Auction System',
      tech: 'PHP + MySQL',
      meaning: 'Best project for showing practical backend logic, database usage, and system-building skills.',
    },
    {
      title: 'PDF-Site',
      label: 'TypeScript web project',
      tech: 'TypeScript',
      meaning: 'Useful for showing TypeScript and structured frontend development practice.',
    },
    {
      title: '2YS2',
      label: 'JavaScript project',
      tech: 'JavaScript',
      meaning: 'Helpful for showing JavaScript learning and browser-based implementation practice.',
    },
    {
      title: 'demo',
      label: 'TypeScript experiment',
      tech: 'TypeScript',
      meaning: 'Good for showing experimentation and learning through small builds.',
    },
  ],
};

const modes: Array<{
  id: AssistantMode;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'askAboutMe',
    title: 'Ask About Me',
    description: 'Profile, skills, contact links, and learning focus.',
    icon: <UserRound size={18} />,
  },
  {
    id: 'projectRecommender',
    title: 'Project Recommender',
    description: 'Find the best project to open first.',
    icon: <Code2 size={18} />,
  },
  {
    id: 'jobMatchHelper',
    title: 'Job Match Helper',
    description: 'Compare a role description against the portfolio.',
    icon: <Briefcase size={18} />,
  },
];

const examplePrompts = [
  'Which project should I view first?',
  'What backend skills does Nuwanaka have?',
  'Is Nuwanaka suitable for an internship?',
  'Match his skills to a web developer role.',
];

const keywordGroups = {
  backend: ['backend', 'server', 'api', 'php', 'laravel', 'mysql', 'database', 'system', 'auction'],
  typescript: ['typescript', 'ts', 'typed'],
  javascript: ['javascript', 'js', 'frontend', 'dom', 'browser'],
  internship: ['internship', 'junior', 'entry level', 'trainee', 'graduate'],
  contact: ['contact', 'github', 'linkedin', 'reach', 'connect'],
  skills: ['skill', 'skills', 'stack', 'technology', 'technologies', 'can he do'],
  job: ['job description', 'requirements', 'responsibilities', 'qualifications', 'role', 'position'],
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    content:
      "Hi, I am the AI Portfolio Assistant. Ask me about Nuwanaka's skills, projects, internship fit, or paste a job description for a quick match analysis.",
  },
];

function normalizeText(text: string) {
  return text.toLowerCase().trim();
}

function createListBlock(title: string, items: string[]) {
  return `${title}:\n- ${items.join('\n- ')}`;
}

async function fetchAssistantResponse(mode: AssistantMode, userMessage: string) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode,
      message: userMessage,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'OpenAI request failed.');
  }

  const data = (await response.json()) as { content?: string };
  if (typeof data.content === 'string' && data.content.trim().length > 0) {
    return data.content.trim();
  }

  return buildResponse(mode, userMessage);
}

function getSkillMatches(text: string) {
  const matches: string[] = [];

  if (['html', 'css', 'react', 'vue', 'frontend', 'ui', 'interface'].some((keyword) => text.includes(keyword))) {
    matches.push('Frontend basics, React, Vue.js, HTML, CSS');
  }

  if (['php', 'laravel', 'backend', 'server', 'api', 'mysql', 'database', 'system'].some((keyword) => text.includes(keyword))) {
    matches.push('PHP, Laravel learning, backend fundamentals, MySQL');
  }

  if (['javascript', 'typescript', 'js', 'ts'].some((keyword) => text.includes(keyword))) {
    matches.push('JavaScript, TypeScript, and project-based web development');
  }

  if (['git', 'github', 'vs code', 'version control'].some((keyword) => text.includes(keyword))) {
    matches.push('Git, GitHub, and VS Code workflow');
  }

  if (['software engineering', 'engineering', 'problem solving'].some((keyword) => text.includes(keyword))) {
    matches.push('Software engineering fundamentals and project-driven learning');
  }

  return [...new Set(matches)];
}

function getProjectRecommendation(text: string) {
  const normalized = normalizeText(text);

  if (['backend', 'full stack', 'full-stack', 'database', 'system', 'auction', 'php', 'mysql', 'api'].some((keyword) => normalized.includes(keyword))) {
    return {
      title: 'BidMaster',
      reason: 'It is the strongest practical web app project for backend logic, database usage, authentication, and system thinking.',
    };
  }

  if (['typescript', 'typed', 'type safety', 'pdf'].some((keyword) => normalized.includes(keyword))) {
    return {
      title: 'PDF-Site',
      reason: 'It is the cleanest TypeScript-focused project to review first for typed web development practice.',
    };
  }

  if (['experiment', 'learning', 'demo', 'javascript', 'frontend', 'dom'].some((keyword) => normalized.includes(keyword))) {
    return {
      title: '2YS2',
      reason: 'It is the best starting point for JavaScript practice and browser-side implementation work.',
    };
  }

  return {
    title: 'BidMaster',
    reason: 'It is the best overall first project because it demonstrates practical backend and web application skills.',
  };
}

function analyzeJobDescription(text: string) {
  const normalized = normalizeText(text);
  const matchedSkills = getSkillMatches(normalized);
  const relevantProjects: string[] = [];

  if (normalized.includes('backend') || normalized.includes('full stack') || normalized.includes('full-stack') || normalized.includes('database') || normalized.includes('php') || normalized.includes('mysql')) {
    relevantProjects.push('BidMaster');
  }
  if (normalized.includes('typescript') || normalized.includes('typed') || normalized.includes('web')) {
    relevantProjects.push('PDF-Site');
  }
  if (normalized.includes('javascript') || normalized.includes('frontend') || normalized.includes('react') || normalized.includes('vue')) {
    relevantProjects.push('2YS2');
  }

  if (relevantProjects.length === 0) {
    relevantProjects.push('BidMaster');
  }

  const learningAreas = portfolioData.skills.learning.filter((item) => {
    const keyword = normalizeText(item);
    return normalized.includes(keyword) || normalized.includes('full stack') || normalized.includes('backend') || normalized.includes('frontend');
  });

  const projectChoice = getProjectRecommendation(text);

  return [
    'I compared the role text with the portfolio data.',
    '',
    createListBlock('Matching skills', matchedSkills.length > 0 ? matchedSkills : ['Frontend basics, backend fundamentals, and project-based learning']),
    '',
    createListBlock('Relevant projects', relevantProjects.map((project) => {
      const matchedProject = portfolioData.projects.find((item) => item.title === project);
      return matchedProject ? `${matchedProject.title} - ${matchedProject.meaning}` : project;
    })),
    '',
    createListBlock('Areas currently learning', learningAreas.length > 0 ? learningAreas : portfolioData.skills.learning),
    '',
    `Suggested project to view first: ${projectChoice.title}`,
    `Why: ${projectChoice.reason}`,
    '',
    'Honest read: Nuwanaka is a good match for internship or junior web development opportunities where he can keep learning while contributing to practical frontend and backend tasks.',
  ].join('\n');
}

function buildResponse(mode: AssistantMode, userMessage: string) {
  const normalized = normalizeText(userMessage);

  if (keywordGroups.contact.some((keyword) => normalized.includes(keyword))) {
    return [
      'Here are the main contact links from the portfolio:',
      `GitHub: ${portfolioData.links.github}`,
      `LinkedIn: ${portfolioData.links.linkedin}`,
      '',
      'Use GitHub to review projects and LinkedIn for professional contact.',
    ].join('\n');
  }

  if (normalized.includes('internship') || normalized.includes('junior developer') || normalized.includes('job match')) {
    return 'Nuwanaka is suitable for internship or junior developer opportunities where he can continue learning while contributing to web development tasks. His strengths include software engineering fundamentals, web development practice, GitHub projects, and current learning in Laravel and Vue.js.';
  }

  if (mode === 'jobMatchHelper' || keywordGroups.job.some((keyword) => normalized.includes(keyword))) {
    return analyzeJobDescription(userMessage);
  }

  if (keywordGroups.skills.some((keyword) => normalized.includes(keyword))) {
    return [
      createListBlock('Frontend', portfolioData.skills.frontend),
      '',
      createListBlock('Backend', portfolioData.skills.backend),
      '',
      createListBlock('Database', portfolioData.skills.database),
      '',
      createListBlock('Tools', portfolioData.skills.tools),
      '',
      createListBlock('Currently learning', portfolioData.skills.learning),
    ].join('\n');
  }

  if (mode === 'projectRecommender' || normalized.includes('project') || normalized.includes('view first') || normalized.includes('show first')) {
    const recommendation = getProjectRecommendation(userMessage);
    const project = portfolioData.projects.find((item) => item.title === recommendation.title);

    return [
      `I recommend starting with ${recommendation.title}.`,
      `Why: ${recommendation.reason}`,
      project ? `Tech: ${project.tech}` : '',
      project ? `Portfolio meaning: ${project.meaning}` : '',
    ].filter(Boolean).join('\n');
  }

  if (normalized.includes('backend') || normalized.includes('laravel') || normalized.includes('mysql') || normalized.includes('php') || normalized.includes('api')) {
    return [
      'Based on the backend focus, I recommend viewing BidMaster first.',
      'It shows practical web application logic, database usage, and system-building skills.',
      '',
      'Relevant backend skills: PHP, Laravel learning, MySQL, backend fundamentals, and project structure.',
    ].join('\n');
  }

  if (mode === 'askAboutMe' || normalized.includes('about') || normalized.includes('who is') || normalized.includes('introduce')) {
    return [
      `${portfolioData.profile.name} is a ${portfolioData.profile.headline} at ${portfolioData.profile.university}.`,
      `${portfolioData.profile.roleSummary}.`,
      `Location: ${portfolioData.profile.location}`,
      `Current focus: ${portfolioData.profile.focusAreas.join(', ')}.`,
      `Currently learning: ${portfolioData.profile.learning.join(' and ')}.`,
    ].join('\n');
  }

  if (normalized.includes('typescript')) {
    const recommendation = getProjectRecommendation(userMessage);
    return [
      'TypeScript is a good signal to look at the typed projects first.',
      `I recommend ${recommendation.title} because it highlights TypeScript practice and web development structure.`,
      'If you want a second view, demo is also useful for learning experiments and iteration.',
    ].join('\n');
  }

  if (normalized.includes('java') || normalized.includes('backend basics')) {
    return [
      'Java is part of the foundation here, especially for software engineering practice and backend thinking.',
      'The strongest practical web-app proof still comes from BidMaster, while the learning path also includes Laravel, Vue.js, PHP, and MySQL.',
    ].join('\n');
  }

  const recommendation = getProjectRecommendation(userMessage);

  return [
    'I can help with profile questions, project recommendations, and job match checks.',
    `A strong default starting point is ${recommendation.title}.`,
    `Reason: ${recommendation.reason}`,
  ].join('\n');
}

export function AIPortfolioAssistant() {
  const [activeMode, setActiveMode] = useState<AssistantMode>('askAboutMe');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messageId, setMessageId] = useState(2);
  const [assistantHealth, setAssistantHealth] = useState<AssistantHealth>({ provider: 'local-fallback', model: fallbackModelName });
  const endRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    fetch('/api/assistant/health')
      .then((response) => response.json())
      .then((data: Partial<AssistantHealth>) => {
        if (data.provider && data.model) {
          setAssistantHealth({ provider: data.provider, model: data.model });
        }
      })
      .catch(() => {
        setAssistantHealth({ provider: 'local-fallback', model: fallbackModelName });
      });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sendMessage = (rawMessage: string) => {
    const trimmedMessage = rawMessage.trim();
    if (!trimmedMessage || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: messageId,
      role: 'user',
      content: trimmedMessage,
    };

    const assistantMessageId = messageId + 1;
    setMessageId((current) => current + 2);
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsThinking(true);

    // Upgrade path: replace the local response engine with a backend or LLM API call.
    timerRef.current = window.setTimeout(() => {
      void fetchAssistantResponse(activeMode, trimmedMessage)
        .then((assistantReply) => {
          setMessages((current) => [...current, { id: assistantMessageId, role: 'assistant', content: assistantReply }]);
        })
        .catch((error: unknown) => {
          const fallbackReply = buildResponse(activeMode, trimmedMessage);
          const errorMessage = error instanceof Error ? error.message : 'Unknown API error.';
          setMessages((current) => [
            ...current,
            {
              id: assistantMessageId,
              role: 'assistant',
              content: `${fallbackReply}\n\nAPI note: ${errorMessage}`,
            },
          ]);
        })
        .finally(() => {
          setIsThinking(false);
        });
    }, 850);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <section id="ai-assistant" className="py-24 relative bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading number="04" title="AI Portfolio Assistant" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-surface/95 shadow-2xl orange-ring"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
          <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-amber-700/10 blur-[100px] pointer-events-none" />

          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-mono text-primary">
                  <Sparkles size={15} /> Powered by AI
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white">Ask AI to explore my skills, projects, and developer journey.</h3>
                <p className="mt-3 text-gray-400 leading-7 max-w-2xl">
                  Answers are based on my portfolio, GitHub projects, and learning journey. The assistant now calls a backend API route, so the key stays off the frontend.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm text-gray-400 shadow-xl backdrop-blur-sm max-w-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <MacWindowControls />
                  <span className="text-xs font-mono uppercase tracking-[0.24em] text-gray-500">assistant panel</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-[0.28em]">
                  <Terminal size={14} /> local ai mode
                </div>
                <p className="mt-2 leading-6">
                  Smart responses are generated from portfolio data, keyword matches, and the selected assistant mode. If the backend cannot reach the model, it falls back safely.
                </p>
                <p className="mt-3 text-xs font-mono text-gray-500">
                  Status: {assistantHealth.provider === 'openai' ? `connected to ${assistantHealth.model}` : 'local fallback active'}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {modes.map((mode) => {
                const isActive = activeMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`group rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover-glow ${
                      isActive
                        ? 'border-primary/60 bg-primary/10 shadow-[0_0_30px_rgba(249,115,22,0.18)]'
                        : 'border-white/10 bg-background/50 hover:border-primary/30'
                    }`}
                  >
                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${isActive ? 'border-primary/40 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-gray-300 group-hover:border-primary/40 group-hover:text-primary'}`}>
                      {mode.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-white">{mode.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{mode.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-background/80 p-4 md:p-5 shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-mono text-primary/80">assistant chat</p>
                    <p className="text-xs text-gray-500">Try a prompt, paste a job description, or ask about contact links.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                    <MacWindowControls className="scale-75" />
                    <span className="inline-flex items-center gap-2">
                      <Brain size={14} className="text-primary" />
                      {modes.find((mode) => mode.id === activeMode)?.title}
                    </span>
                  </div>
                </div>

                <div className="mt-5 max-h-[28rem] overflow-y-auto pr-1 space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => {
                      const isUser = message.role === 'user';

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-[90%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isUser ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-primary'}`}>
                              {isUser ? <UserRound size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={`rounded-3xl px-4 py-3 shadow-lg ${isUser ? 'bg-primary/10 border border-primary/25 text-white' : 'bg-surface border border-white/10 text-gray-300'}`}>
                              <p className="whitespace-pre-line leading-7 text-sm md:text-[0.95rem]">{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex max-w-[90%] gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary">
                          <Bot size={18} />
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-surface px-4 py-3 shadow-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">thinking</span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]" />
                              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.1s]" />
                              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={endRef} />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-mono uppercase tracking-[0.24em] text-gray-500">example prompts</p>
                  <div className="flex flex-wrap gap-3">
                    {examplePrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                        disabled={isThinking}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:border-primary/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <label className="sr-only" htmlFor="ai-portfolio-question">
                      Ask the AI Portfolio Assistant
                    </label>
                    <textarea
                      id="ai-portfolio-question"
                      rows={2}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isThinking}
                      placeholder="Ask about skills, projects, internships, or paste a job description..."
                      className="min-h-[3.25rem] flex-1 resize-none rounded-2xl border border-white/10 bg-background px-4 py-2.5 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isThinking || input.trim().length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white transition-all hover:bg-primaryHover hover-glow disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Send
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-background/80 p-5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-primary/80">portfolio snapshot</p>
                      <h4 className="text-lg font-semibold text-white">What the assistant knows</h4>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm leading-6 text-gray-400">
                    <p>
                      <span className="text-white font-medium">Name:</span> {portfolioData.profile.name}
                      <br />
                      <span className="text-white font-medium">Headline:</span> {portfolioData.profile.headline}
                      <br />
                      <span className="text-white font-medium">University:</span> {portfolioData.profile.university}
                      <br />
                      <span className="text-white font-medium">Location:</span> {portfolioData.profile.location}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <a href={portfolioData.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:border-primary/40">
                        <span className="inline-flex items-center gap-2"><Github size={16} className="text-primary" /> GitHub</span>
                        <ArrowUpRight size={16} className="text-gray-500" />
                      </a>
                      <a href={portfolioData.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:border-primary/40">
                        <span className="inline-flex items-center gap-2"><Linkedin size={16} className="text-primary" /> LinkedIn</span>
                        <ArrowUpRight size={16} className="text-gray-500" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-background/80 p-5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-primary/80">project guidance</p>
                      <h4 className="text-lg font-semibold text-white">Best first project picks</h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {portfolioData.projects.slice(0, 3).map((project) => (
                      <div key={project.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white">{project.title}</p>
                          <span className="text-[11px] uppercase tracking-[0.22em] text-primary/80">{project.tech}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400 leading-6">{project.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-background/80 p-5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-primary/80">current direction</p>
                      <h4 className="text-lg font-semibold text-white">Learning focus</h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {portfolioData.profile.learning.concat(portfolioData.profile.focusAreas.slice(0, 2)).map((item) => (
                      <span key={item} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
                        {item}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    The assistant stays honest and student-focused: no inflated claims, just the current skills, real projects, and learning path.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}