export type ProjectVisibility = 'Public' | 'Private';

export const projectFilters = ['All', 'Featured', 'GitHub', 'Private', 'Frontend', 'Full-Stack', 'AI Integration', 'JavaScript', 'TypeScript', 'PHP', 'Java'] as const;

export type ProjectFilter = (typeof projectFilters)[number];

export type Project = {
  id: string | number;
  title: string;
  displayName?: string;
  subtitle: string;
  description: string;
  category: string;
  type: string;
  status: string;
  visibility: ProjectVisibility;
  featured: boolean;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  stars?: number;
  forks?: number;
  language?: string;
  languagesUsed?: string[];
  updatedAt?: string;
  createdAt?: string;
  image: string;
  fallbackImage: boolean;
  hasLiveDemo?: boolean;
  lastUpdatedLabel?: string;
  isRecent?: boolean;
  source?: 'GitHub Repository' | 'Manual';
  images?: string[];
  problem?: string;
  solution?: string;
  features?: string[];
  caseStudyUrl?: string;
  year?: string;
  role?: string;
  learningOutcome?: string;
};

export function formatProjectDisplayName(name: string) {
  const normalized = name
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return name;
  }

  return normalized
    .split(' ')
    .map((word) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) {
        return word;
      }

      if (word.length <= 3 && /^[A-Za-z0-9]+$/.test(word)) {
        return word.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function formatProjectDate(value?: string) {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

export function isRecentProject(value?: string) {
  if (!value) {
    return false;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const daysSinceUpdate = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate <= 90;
}

export function getProjectStats(projectList: Project[]) {
  return {
    total: projectList.length,
    githubRepositories: projectList.filter((project) => project.type === 'GitHub Repository').length,
    privateProjects: projectList.filter((project) => project.visibility === 'Private').length,
    featuredProjects: projectList.filter((project) => project.featured).length,
  };
}
