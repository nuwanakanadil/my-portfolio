import fs from 'fs';
import path from 'path';

const CONFIG_ALLOWLIST_PATH = path.join(process.cwd(), 'config', 'github-allowlist.json');
const CONFIG_OVERRIDES_PATH = path.join(process.cwd(), 'config', 'github-repo-overrides.json');
const GITHUB_REPOS_URL = 'https://api.github.com/users/nuwanakanadil/repos?sort=updated&per_page=100';
const DEFAULT_ALLOWED_REPO_NAMES = ['bidmaster', 'pdf-site', '2ys2', 'demo'];

function getAllowedRepoNames() {
  try {
    if (fs.existsSync(CONFIG_ALLOWLIST_PATH)) {
      const raw = fs.readFileSync(CONFIG_ALLOWLIST_PATH, 'utf8');
      const parsed = raw ? JSON.parse(raw) : null;

      let list = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (typeof parsed === 'string') {
        list = parsed.split(',');
      } else if (parsed && Array.isArray(parsed.allowlist)) {
        list = parsed.allowlist;
      } else if (parsed && typeof parsed.allowlist === 'string') {
        list = parsed.allowlist.split(',');
      }

      const setFromFile = new Set(
        list
          .map((v) => String(v || '').trim().toLowerCase())
          .filter(Boolean),
      );

      if (setFromFile.size > 0) {
        return setFromFile;
      }
    }
  } catch (e) {
    // ignore parse/read errors and fallback to env/default
  }

  const configuredValue = typeof process.env.GITHUB_PROJECT_ALLOWLIST === 'string' ? process.env.GITHUB_PROJECT_ALLOWLIST : '';

  if (configuredValue.trim()) {
    return new Set(
      configuredValue
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  return new Set(DEFAULT_ALLOWED_REPO_NAMES);
}

function getRepoOverrides() {
  try {
    if (fs.existsSync(CONFIG_OVERRIDES_PATH)) {
      const raw = fs.readFileSync(CONFIG_OVERRIDES_PATH, 'utf8');
      const parsed = raw ? JSON.parse(raw) : null;

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // normalize keys to lowercase repo names
        const normalized = {};
        for (const [k, v] of Object.entries(parsed)) {
          normalized[String(k || '').toLowerCase()] = v;
        }
        return normalized;
      }
    }
  } catch (e) {
    // ignore and return empty
  }

  return {};
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }

  res.end(JSON.stringify(payload));
}

function normalizeDisplayName(name) {
  return String(name || '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
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

function formatDateLabel(value) {
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

function isRecentUpdate(value) {
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

function getRequestUrl(request) {
  if (typeof request.url === 'string' && request.url.length > 0) {
    return request.url;
  }

  return '/api/github-projects';
}

function mapRepository(repo) {
  const displayName = normalizeDisplayName(repo.name);

  return {
    id: repo.id,
    title: repo.name,
    displayName,
    subtitle: repo.description || 'GitHub repository',
    description: repo.description || 'A public GitHub project by Nuwanaka Nadil.',
    category: repo.language || 'Project',
    type: 'GitHub Repository',
    status: 'Public',
    visibility: 'Public',
    featured: false,
    techStack: [repo.language].filter(Boolean),
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || '',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    languagesUsed: [],
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    image: `/projects/${String(repo.name || '').toLowerCase()}.png`,
    fallbackImage: true,
    hasLiveDemo: Boolean(repo.homepage),
    lastUpdatedLabel: formatDateLabel(repo.updated_at),
    isRecent: isRecentUpdate(repo.updated_at),
    source: 'GitHub Repository',
  };
}

function mapLanguages(languagesData, fallbackLanguage) {
  if (!languagesData || typeof languagesData !== 'object' || Array.isArray(languagesData)) {
    return fallbackLanguage ? [fallbackLanguage] : [];
  }

  const languages = Object.entries(languagesData)
    .filter(([, bytes]) => Number(bytes) > 0)
    .sort((left, right) => Number(right[1]) - Number(left[1]))
    .map(([language]) => language);

  if (languages.length > 0) {
    return languages;
  }

  return fallbackLanguage ? [fallbackLanguage] : [];
}

async function fetchRepoLanguages(languagesUrl, headers, fallbackLanguage) {
  if (!languagesUrl) {
    return fallbackLanguage ? [fallbackLanguage] : [];
  }

  try {
    const response = await fetch(languagesUrl, { headers });
    if (!response.ok) {
      return fallbackLanguage ? [fallbackLanguage] : [];
    }

    const data = await response.json().catch(() => null);
    return mapLanguages(data, fallbackLanguage);
  } catch {
    return fallbackLanguage ? [fallbackLanguage] : [];
  }
}

async function handleGitHubProjectsRequest(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  if (typeof response.setHeader === 'function') {
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  }

  try {
    const requestUrl = new URL(getRequestUrl(request), 'http://localhost');
    const includeForks = requestUrl.searchParams.get('includeForks');
    const shouldIncludeForks = includeForks === 'true' || includeForks === '1';
    const allowedRepoNames = getAllowedRepoNames();

    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const githubResponse = await fetch(GITHUB_REPOS_URL, {
      headers,
    });

    const responseText = await githubResponse.text();
    let data = [];

    try {
      data = responseText ? JSON.parse(responseText) : [];
    } catch {
      data = [];
    }

    if (!githubResponse.ok) {
      const errorMessage = data?.message || responseText || 'GitHub request failed.';
      sendJson(response, githubResponse.status, { error: errorMessage });
      return;
    }

    const overrides = getRepoOverrides();

    const repositories = Array.isArray(data)
      ? data
          .filter((repo) => (shouldIncludeForks ? true : !repo.fork))
          .filter((repo) => allowedRepoNames.has(String(repo.name || '').toLowerCase()))
          .map(async (repo) => {
            const mapped = mapRepository(repo);
            const override = overrides[String(repo.name || '').toLowerCase()];

            if (!override || typeof override !== 'object') {
              mapped.languagesUsed = await fetchRepoLanguages(repo.languages_url, headers, repo.language);
              return mapped;
            }

            // shallow merge: override fields take precedence
            const merged = Object.assign({}, mapped, override);

            // merge arrays sensibly: techStack and images
            if (Array.isArray(mapped.techStack) || Array.isArray(override.techStack)) {
              const left = Array.isArray(override.techStack) ? override.techStack : mapped.techStack || [];
              merged.techStack = Array.from(new Set(left.concat(mapped.techStack || [])));
            }

            if (Array.isArray(override.images) && override.images.length > 0) {
              merged.images = override.images;
              merged.image = override.image || override.images[0];
            } else if (Array.isArray(mapped.images) && mapped.images.length > 0) {
              merged.images = mapped.images;
              merged.image = override.image || mapped.image || mapped.images[0];
            } else if (override.image) {
              merged.image = override.image;
            }

            merged.languagesUsed = Array.isArray(override.languagesUsed) && override.languagesUsed.length > 0
              ? override.languagesUsed
              : await fetchRepoLanguages(repo.languages_url, headers, repo.language);

            return merged;
          })
      : [];

    const resolvedRepositories = await Promise.all(repositories);

    sendJson(response, 200, {
      projects: resolvedRepositories,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown GitHub API error.';
    sendJson(response, 500, { error: errorMessage });
  }
}

export { handleGitHubProjectsRequest };
export default handleGitHubProjectsRequest;