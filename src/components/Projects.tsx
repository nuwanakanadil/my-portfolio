import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderGit2,
  Github,
  Search,
  Star,
  X,
} from 'lucide-react';
import { MacWindowControls } from './MacWindowControls';
import { formatProjectDate, formatProjectDisplayName, getProjectStats, projectFilters, type Project, type ProjectFilter } from '../data/projects';
import { manualProjects } from '../data/manualProjects';

type GitHubProjectsResponse = {
  projects?: Project[];
  error?: string;
};

function getProjectInitials(title: string) {
  const cleanedTitle = title.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  const words = cleanedTitle ? cleanedTitle.split(/\s+/) : [title];
  const initials = words
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || title.slice(0, 2).toUpperCase();
}

function getProjectDisplayLabel(project: Project) {
  return project.displayName || formatProjectDisplayName(project.title);
}

function getProjectImage(project: Project) {
  return project.image || project.images?.[0] || '/projects/project-placeholder.png';
}

function getProjectGallery(project: Project) {
  return project.images && project.images.length > 0 ? project.images : [getProjectImage(project)];
}

function isGitHubProject(project: Project) {
  return project.type === 'GitHub Repository';
}

function compareDateValues(left?: string, right?: string) {
  const leftValue = left ? new Date(left).getTime() : 0;
  const rightValue = right ? new Date(right).getTime() : 0;
  return rightValue - leftValue;
}

function matchesSearch(project: Project, searchValue: string) {
  if (!searchValue) {
    return true;
  }

  const haystack = [
    getProjectDisplayLabel(project),
    project.title,
    project.subtitle,
    project.description,
    project.category,
    project.language,
    project.languagesUsed?.join(' '),
    project.type,
    project.techStack.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(searchValue.toLowerCase());
}

function ProjectVisual({
  project,
  hasImageError,
  onImageError,
}: {
  project: Project;
  hasImageError: boolean;
  onImageError: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayLabel = getProjectDisplayLabel(project);
  const gallery = getProjectGallery(project);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project.id, project.image]);

  if (hasImageError) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-background via-slate-950 to-primary/20 p-6 text-center shadow-inner">
        <div>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-xl font-bold text-primary">
            {getProjectInitials(displayLabel)}
          </div>
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-primary/80">{displayLabel}</p>
          <p className="mt-2 text-xs text-gray-500">Screenshot placeholder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background shadow-inner">
      <img
        src={gallery[currentImageIndex] || getProjectImage(project)}
        alt={`${displayLabel} screenshot`}
        className="aspect-[16/10] w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          if (currentImageIndex < gallery.length - 1) {
            setCurrentImageIndex((value) => value + 1);
            return;
          }

          onImageError();
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-primary backdrop-blur-sm">
        {project.visibility}
      </div>
      {project.featured && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-primary backdrop-blur-sm">
          Featured
        </div>
      )}
    </div>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${className}`}>{children}</span>;
}

function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface p-4 shadow-2xl">
      <div className="aspect-[16/10] animate-pulse rounded-2xl bg-gradient-to-br from-background via-slate-900 to-primary/10" />
      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/8" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/8" />
          <div className="h-6 w-18 animate-pulse rounded-full bg-white/8" />
        </div>
        <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/8" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-10/12 animate-pulse rounded-full bg-white/8" />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="h-7 w-16 animate-pulse rounded-full bg-white/8" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-white/8" />
          <div className="h-7 w-14 animate-pulse rounded-full bg-white/8" />
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');
  const [searchValue, setSearchValue] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [githubProjects, setGitHubProjects] = useState<Project[]>([]);
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(true);
  const [githubError, setGitHubError] = useState<string | null>(null);

  async function loadGitHubProjects(forceRefresh = false) {
    setIsLoadingGitHub(true);
    setGitHubError(null);

    try {
      const requestUrl = forceRefresh ? `/api/github-projects?refresh=${Date.now()}` : '/api/github-projects';
      const response = await fetch(requestUrl, {
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => ({}))) as GitHubProjectsResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load GitHub repositories.');
      }

      setGitHubProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to load GitHub repositories.';
      setGitHubProjects([]);
      setGitHubError(errorMessage);
    } finally {
      setIsLoadingGitHub(false);
    }
  }

  useEffect(() => {
    void loadGitHubProjects();
  }, []);

  const manualProjectList = useMemo(() => [...manualProjects].sort((left, right) => Number(right.featured) - Number(left.featured)), []);

  const sortedGitHubProjects = useMemo(
    () =>
      [...githubProjects].sort(
        (left, right) => Number(right.featured) - Number(left.featured) || compareDateValues(left.updatedAt, right.updatedAt),
      ),
    [githubProjects],
  );

  const allProjects = useMemo(() => [...manualProjectList, ...sortedGitHubProjects], [manualProjectList, sortedGitHubProjects]);
  const stats = useMemo(() => getProjectStats(allProjects), [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const filterMatches =
        activeFilter === 'All'
          ? true
          : activeFilter === 'Featured'
            ? project.featured
            : activeFilter === 'GitHub'
              ? isGitHubProject(project)
              : activeFilter === 'Private'
                ? project.visibility === 'Private'
                : project.category === activeFilter;

      return filterMatches && matchesSearch(project, searchValue);
    });
  }, [activeFilter, allProjects, searchValue]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    setActiveImageIndex(0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProject(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedProject]);

  const showGitHubEmptyState = !isLoadingGitHub && !githubError && githubProjects.length === 0;

  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading number="03" title="Projects" />

        <div className="mb-10 max-w-4xl space-y-4">
          <p className="text-lg leading-8 text-gray-300">
            Public GitHub repositories and selected private or academic projects that show how I build, learn, and solve problems.
          </p>
          <p className="text-sm leading-7 text-gray-500">
            Public repositories are loaded from GitHub automatically. Private projects are shown with screenshots and case-study details where available.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-surface p-4 shadow-xl">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-gray-500">Total Projects</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4 shadow-xl">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-gray-500">GitHub Repositories</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.githubRepositories}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4 shadow-xl">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-gray-500">Private Projects</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.privateProjects}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface p-4 shadow-xl">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-gray-500">Featured Projects</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.featuredProjects}</p>
          </div>
        </div>

        <div className="mb-8 rounded-[1.75rem] border border-primary/20 bg-surface/95 p-4 shadow-2xl orange-ring md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 text-sm font-mono uppercase tracking-[0.22em] text-primary">
                <CheckCircle2 size={14} /> Project filters
              </div>
              <p className="text-sm leading-6 text-gray-400">
                Search by title, description, language, category, or tech stack. Featured projects stay near the top so the strongest work is easy to find.
              </p>
            </div>

            <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-gray-400 shadow-inner focus-within:border-primary/50 lg:w-auto lg:flex-1">
              <Search size={18} className="shrink-0 text-primary/80" />
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search projects, tech stack, or descriptions"
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {projectFilters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover-glow ${
                    isActive
                      ? 'border-primary/50 bg-primary/15 text-white shadow-[0_0_24px_rgba(249,115,22,0.16)]'
                      : 'border-white/10 bg-background/60 text-gray-300 hover:border-primary/30 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {githubError && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-white">GitHub repositories could not be loaded.</p>
                <p className="mt-1 text-amber-100/80">{githubError}</p>
              </div>
              <button
                type="button"
                onClick={() => void loadGitHubProjects(true)}
                className="inline-flex items-center justify-center rounded-xl border border-amber-200/20 bg-background/40 px-4 py-2 font-semibold text-white transition-colors hover:border-primary/40"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {showGitHubEmptyState && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-surface px-5 py-4 text-sm text-gray-400">
            No public GitHub repositories were returned yet.
          </div>
        )}

        {isLoadingGitHub ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectCardSkeleton key={`project-skeleton-${index}`} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-surface p-10 text-center text-gray-400">
            No projects match the current filter.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => {
              const projectKey = String(project.id);
              const hasImageError = Boolean(imageErrors[projectKey]);

              return (
                <motion.article
                  key={projectKey}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative overflow-hidden rounded-[1.75rem] border bg-surface p-4 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_80px_rgba(249,115,22,0.18)] ${
                    selectedProject?.id === project.id ? 'border-primary/60' : 'border-white/10'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative space-y-4">
                    <ProjectVisual
                      project={project}
                      hasImageError={hasImageError}
                      onImageError={() => setImageErrors((current) => ({ ...current, [projectKey]: true }))}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-primary/20 bg-primary/10 text-primary">{project.category}</Badge>
                      <Badge className="border-white/10 bg-white/5 text-gray-300">{project.status}</Badge>
                      <Badge className={project.visibility === 'Private' ? 'border-amber-500/25 bg-amber-500/10 text-amber-300' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'}>
                        {project.visibility}
                      </Badge>
                      {isGitHubProject(project) ? (
                        <Badge className="border-sky-500/25 bg-sky-500/10 text-sky-300">
                          <FolderGit2 size={12} className="mr-1" /> GitHub
                        </Badge>
                      ) : (
                        <Badge className="border-white/10 bg-white/5 text-gray-300">{project.type}</Badge>
                      )}
                      {project.featured && <Badge className="border-primary/20 bg-primary/10 text-primary">Featured</Badge>}
                    </div>

                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">{project.type}</p>
                      <h3 className="mt-2 text-2xl font-bold text-white transition-colors group-hover:text-primary">{getProjectDisplayLabel(project)}</h3>
                      {project.displayName && project.displayName !== project.title && (
                        <p className="mt-1 text-sm text-primary/70">{project.title}</p>
                      )}
                      <p className="mt-1 text-sm text-primary/70">{project.subtitle}</p>
                    </div>

                    <p className="text-sm leading-7 text-gray-400">{project.description}</p>

                    {project.visibility === 'Private' && (
                      <p className="rounded-2xl border border-amber-500/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        Private project - screenshots shared for portfolio purposes.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 6).map((tech) => (
                        <span key={tech} className="rounded-full border border-white/10 bg-background px-3 py-1 text-xs font-mono text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-gray-500">
                      {project.lastUpdatedLabel ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background px-3 py-1.5">
                          <Clock3 size={13} className="text-primary" />
                          Updated {project.lastUpdatedLabel}
                        </span>
                      ) : null}
                      {typeof project.stars === 'number' ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background px-3 py-1.5">
                          <Star size={13} className="text-primary" />
                          {project.stars} stars
                        </span>
                      ) : null}
                      {typeof project.forks === 'number' ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background px-3 py-1.5">
                          <Github size={13} className="text-primary" />
                          {project.forks} forks
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-all hover:bg-primaryHover hover-glow"
                      >
                        View Details
                        <ChevronRight size={18} />
                      </button>

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-background px-4 py-2.5 font-semibold text-white transition-all hover:border-primary/40"
                        >
                          <Github size={18} />
                          GitHub
                        </a>
                      ) : null}

                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-background px-4 py-2.5 font-semibold text-white transition-all hover:border-primary/40"
                        >
                          <ExternalLink size={18} />
                          Live Demo
                        </a>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-primary/25 bg-surface shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
              <div className="relative overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
                  <MacWindowControls />
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background px-3 py-2 text-sm text-gray-300 transition-colors hover:border-primary/40 hover:text-white"
                  >
                    Close
                    <X size={16} />
                  </button>
                </div>

                <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
                  <div className="space-y-5">
                    {(() => {
                      const gallery = getProjectGallery(selectedProject);
                      const activeImage = gallery[activeImageIndex] || gallery[0];
                      const hasImageError = Boolean(imageErrors[String(selectedProject.id)]);

                      return (
                        <div className="space-y-4">
                          <ProjectVisual
                            project={{ ...selectedProject, image: activeImage }}
                            hasImageError={hasImageError}
                            onImageError={() => setImageErrors((current) => ({ ...current, [String(selectedProject.id)]: true }))}
                          />

                          {gallery.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                              {gallery.map((image, imageIndex) => {
                                const isActive = imageIndex === activeImageIndex;

                                return (
                                  <button
                                    key={image}
                                    type="button"
                                    onClick={() => setActiveImageIndex(imageIndex)}
                                    className={`overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                                      isActive ? 'border-primary/60 ring-2 ring-primary/30' : 'border-white/10 hover:border-primary/30'
                                    }`}
                                    aria-label={`View screenshot ${imageIndex + 1} for ${getProjectDisplayLabel(selectedProject)}`}
                                  >
                                    <img
                                      src={image}
                                      alt={`${getProjectDisplayLabel(selectedProject)} screenshot ${imageIndex + 1}`}
                                      className="h-20 w-full object-cover"
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        setImageErrors((current) => ({ ...current, [String(selectedProject.id)]: true }));
                                      }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-xs font-mono uppercase tracking-[0.22em] text-gray-500">Screenshot gallery</p>
                        </div>
                      );
                    })()}

                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-primary/20 bg-primary/10 text-primary">{selectedProject.category}</Badge>
                      <Badge className="border-white/10 bg-white/5 text-gray-300">{selectedProject.type}</Badge>
                      <Badge className={selectedProject.visibility === 'Private' ? 'border-amber-500/25 bg-amber-500/10 text-amber-300' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'}>
                        {selectedProject.visibility}
                      </Badge>
                      {selectedProject.language ? <Badge className="border-white/10 bg-white/5 text-gray-300">{selectedProject.language}</Badge> : null}
                      {selectedProject.lastUpdatedLabel ? <Badge className="border-white/10 bg-white/5 text-gray-300">Updated {selectedProject.lastUpdatedLabel}</Badge> : null}
                    </div>

                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">{selectedProject.role || selectedProject.type}</p>
                      <h3 id="project-modal-title" className="mt-2 text-3xl font-bold text-white md:text-4xl">
                        {getProjectDisplayLabel(selectedProject)}
                      </h3>
                      {selectedProject.displayName && selectedProject.displayName !== selectedProject.title && (
                        <p className="mt-2 text-sm text-primary/70">Repo name: {selectedProject.title}</p>
                      )}
                      <p className="mt-2 text-lg text-primary/75">{selectedProject.subtitle}</p>
                    </div>

                    <p className="text-sm leading-7 text-gray-300 md:text-[0.95rem]">{selectedProject.description}</p>

                    {selectedProject.visibility === 'Private' && (
                      <p className="rounded-2xl border border-amber-500/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        This project is private, but screenshots and details are shared for portfolio purposes.
                      </p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedProject.problem ? (
                        <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
                          <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Problem</p>
                          <p className="mt-2 text-sm leading-7 text-gray-300">{selectedProject.problem}</p>
                        </div>
                      ) : null}
                      {selectedProject.solution ? (
                        <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
                          <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Solution</p>
                          <p className="mt-2 text-sm leading-7 text-gray-300">{selectedProject.solution}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {selectedProject.features && selectedProject.features.length > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                        <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Features</p>
                        <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-300">
                          {selectedProject.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                      <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Tech stack</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedProject.techStack.map((tech) => (
                          <span key={tech} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedProject.languagesUsed && selectedProject.languagesUsed.length > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                        <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Languages used</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedProject.languagesUsed.map((languageName) => (
                            <span key={languageName} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-gray-300">
                              {languageName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                        <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Project facts</p>
                        <div className="mt-2 space-y-2 text-sm leading-7 text-gray-300">
                          <p>
                            <span className="text-white font-medium">Visibility:</span> {selectedProject.visibility}
                          </p>
                          {selectedProject.createdAt ? (
                            <p>
                              <span className="text-white font-medium">Created:</span> {formatProjectDate(selectedProject.createdAt)}
                            </p>
                          ) : null}
                          {selectedProject.updatedAt ? (
                            <p>
                              <span className="text-white font-medium">Updated:</span> {formatProjectDate(selectedProject.updatedAt)}
                            </p>
                          ) : null}
                          {typeof selectedProject.stars === 'number' ? (
                            <p>
                              <span className="text-white font-medium">Stars:</span> {selectedProject.stars}
                            </p>
                          ) : null}
                          {typeof selectedProject.forks === 'number' ? (
                            <p>
                              <span className="text-white font-medium">Forks:</span> {selectedProject.forks}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                        <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Role</p>
                        <p className="mt-2 text-sm leading-7 text-gray-300">{selectedProject.role || 'Developer'}</p>
                        {selectedProject.year ? (
                          <>
                            <p className="mt-4 text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Year</p>
                            <p className="mt-2 text-sm text-gray-300">{selectedProject.year}</p>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {selectedProject.learningOutcome ? (
                      <div className="rounded-2xl border border-white/10 bg-background/70 p-5">
                        <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/70">Learning outcome</p>
                        <p className="mt-2 text-sm leading-7 text-gray-300">{selectedProject.learningOutcome}</p>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      {selectedProject.githubUrl ? (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-all hover:bg-primaryHover hover-glow"
                        >
                          <Github size={18} />
                          GitHub
                        </a>
                      ) : null}

                      {selectedProject.liveUrl ? (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-background px-4 py-2.5 font-semibold text-white transition-all hover:border-primary/40"
                        >
                          <ExternalLink size={18} />
                          Live Demo
                        </a>
                      ) : null}

                      {selectedProject.caseStudyUrl ? (
                        <a
                          href={selectedProject.caseStudyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-background px-4 py-2.5 font-semibold text-white transition-all hover:border-primary/40"
                        >
                          <ArrowUpRight size={18} />
                          Case Study
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
