import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const serverPort = Number(process.env.PORT || 8787);
const defaultModel = process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const projectRoot = resolve(process.cwd());
loadEnvFile(resolve(projectRoot, '.env.local'));
loadEnvFile(resolve(projectRoot, '.env'));

const openAIApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const openAIModel = process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || defaultModel;
const contactInbox = [];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      resolveBody(body);
    });

    request.on('error', (error) => {
      rejectBody(error);
    });
  });
}

function normalizeText(text) {
  return text.toLowerCase().trim();
}

function createListBlock(title, items) {
  return `${title}:\n- ${items.join('\n- ')}`;
}

function buildPortfolioContext() {
  return [
    'Name: Nuwanaka Nadil',
    'Headline: Software Engineering Undergraduate',
    'Role summary: Software Engineer / Full Stack Developer / MERN Stack Developer / React Developer',
    'University: SLIIT',
    'Location: Gampaha, Sri Lanka',
    'Current learning: Laravel, Vue.js',
    'Focus areas: Web Development, Software Engineering, Backend Systems, Full-stack Development',
    createListBlock('Frontend skills', ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js']),
    createListBlock('Backend skills', ['Java', 'PHP', 'Laravel', 'Backend basics', 'MERN stack learning']),
    createListBlock('Database skills', ['MySQL', 'CRUD', 'Schema design']),
    createListBlock('Tools', ['Git', 'GitHub', 'VS Code']),
    createListBlock('Projects', [
      'BidMaster - Best project for showing practical backend logic, database usage, and system-building skills.',
      'PDF-Site - Useful for showing TypeScript and structured frontend development practice.',
      '2YS2 - Helpful for showing JavaScript learning and browser-based implementation practice.',
      'demo - Good for showing experimentation and learning through small builds.',
    ]),
  ].join('\n\n');
}

function getSkillMatches(text) {
  const matches = [];

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

function getProjectRecommendation(text) {
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

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildProjectList(projectNames) {
  return projectNames.map((project) => {
    if (project === 'BidMaster') {
      return 'BidMaster - Best project for showing practical backend logic, database usage, and system-building skills.';
    }

    if (project === 'PDF-Site') {
      return 'PDF-Site - Useful for showing TypeScript and structured frontend development practice.';
    }

    return '2YS2 - Helpful for showing JavaScript learning and browser-based implementation practice.';
  });
}

function buildSkillsFallback() {
  return [
    createListBlock('Frontend', ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js']),
    '',
    createListBlock('Backend', ['Java', 'PHP', 'Laravel', 'Backend basics', 'MERN stack learning']),
    '',
    createListBlock('Database', ['MySQL', 'CRUD', 'Schema design']),
    '',
    createListBlock('Tools', ['Git', 'GitHub', 'VS Code']),
    '',
    createListBlock('Currently learning', ['Laravel', 'Vue.js', 'Full-stack patterns', 'APIs']),
  ].join('\n');
}

function buildJobMatchFallback(userMessage) {
  const normalized = normalizeText(userMessage);
  const matchedSkills = getSkillMatches(normalized);
  const relevantProjects = [];

  if (hasAnyKeyword(normalized, ['backend', 'full stack', 'full-stack', 'database', 'php', 'mysql'])) {
    relevantProjects.push('BidMaster');
  }

  if (hasAnyKeyword(normalized, ['typescript', 'typed', 'web'])) {
    relevantProjects.push('PDF-Site');
  }

  if (hasAnyKeyword(normalized, ['javascript', 'frontend', 'react', 'vue'])) {
    relevantProjects.push('2YS2');
  }

  if (relevantProjects.length === 0) {
    relevantProjects.push('BidMaster');
  }

  const projectChoice = getProjectRecommendation(userMessage);

  return [
    'I compared the role text with the portfolio data.',
    '',
    createListBlock('Matching skills', matchedSkills.length > 0 ? matchedSkills : ['Frontend basics, backend fundamentals, and project-based learning']),
    '',
    createListBlock('Relevant projects', buildProjectList(relevantProjects)),
    '',
    createListBlock('Areas currently learning', ['Laravel', 'Vue.js', 'Full-stack patterns', 'APIs']),
    '',
    `Suggested project to view first: ${projectChoice.title}`,
    `Why: ${projectChoice.reason}`,
    '',
    'Honest read: Nuwanaka is a good match for internship or junior web development opportunities where he can keep learning while contributing to practical frontend and backend tasks.',
  ].join('\n');
}

function buildContactFallback(userMessage) {
  const normalized = normalizeText(userMessage);

  if (hasAnyKeyword(normalized, ['contact', 'github', 'linkedin', 'reach', 'connect'])) {
    return [
      'Here are the main contact links from the portfolio:',
      'GitHub: https://github.com/nuwanakanadil',
      'LinkedIn: https://www.linkedin.com/in/nuwanaka-nadil-9145442a5/',
      '',
      'Use GitHub to review projects and LinkedIn for professional contact.',
    ].join('\n');
  }

  return null;
}

function buildAboutFallback(userMessage) {
  const normalized = normalizeText(userMessage);

  if (hasAnyKeyword(normalized, ['internship', 'junior developer', 'job match'])) {
    return 'Nuwanaka is suitable for internship or junior developer opportunities where he can continue learning while contributing to web development tasks. His strengths include software engineering fundamentals, web development practice, GitHub projects, and current learning in Laravel and Vue.js.';
  }

  if (hasAnyKeyword(normalized, ['backend', 'laravel', 'mysql', 'php', 'api'])) {
    return [
      'Based on the backend focus, I recommend viewing BidMaster first.',
      'It shows practical web application logic, database usage, and system-building skills.',
      '',
      'Relevant backend skills: PHP, Laravel learning, MySQL, backend fundamentals, and project structure.',
    ].join('\n');
  }

  if (hasAnyKeyword(normalized, ['typescript'])) {
    return [
      'TypeScript is a good signal to look at the typed projects first.',
      'I recommend PDF-Site because it highlights TypeScript practice and web development structure.',
      'If you want a second view, demo is also useful for learning experiments and iteration.',
    ].join('\n');
  }

  if (hasAnyKeyword(normalized, ['java', 'backend basics'])) {
    return [
      'Java is part of the foundation here, especially for software engineering practice and backend thinking.',
      'The strongest practical web-app proof still comes from BidMaster, while the learning path also includes Laravel, Vue.js, PHP, and MySQL.',
    ].join('\n');
  }

  return null;
}

function buildLocalFallback(mode, userMessage) {
  const normalized = normalizeText(userMessage);

  if (mode === 'jobMatchHelper' || hasAnyKeyword(normalized, ['job description', 'requirements', 'responsibilities', 'qualifications', 'role', 'position'])) {
    return buildJobMatchFallback(userMessage);
  }

  if (hasAnyKeyword(normalized, ['skill', 'skills', 'stack', 'technology', 'technologies', 'can he do'])) {
    return buildSkillsFallback();
  }

  if (mode === 'projectRecommender' || normalized.includes('project') || normalized.includes('view first') || normalized.includes('show first')) {
    const recommendation = getProjectRecommendation(userMessage);
    return [
      `I recommend starting with ${recommendation.title}.`,
      `Why: ${recommendation.reason}`,
    ].join('\n');
  }

  const contactFallback = buildContactFallback(userMessage);
  if (contactFallback) {
    return contactFallback;
  }

  const aboutFallback = buildAboutFallback(userMessage);
  if (aboutFallback) {
    return aboutFallback;
  }

  if (mode === 'askAboutMe' || normalized.includes('about') || normalized.includes('who is') || normalized.includes('introduce')) {
    return [
      'Nuwanaka Nadil is a Software Engineering Undergraduate at SLIIT.',
      'He is focused on web development, software engineering, backend systems, and full-stack development.',
      'Currently learning: Laravel and Vue.js.',
    ].join('\n');
  }

  const recommendation = getProjectRecommendation(userMessage);

  return [
    'I can help with profile questions, project recommendations, and job match checks.',
    `A strong default starting point is ${recommendation.title}.`,
    `Reason: ${recommendation.reason}`,
  ].join('\n');
}

function normalizeContactField(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function buildContactResponse(submission) {
  return [
    'Thanks for reaching out. The message was received by the local backend.',
    '',
    `Name: ${submission.name || 'Not provided'}`,
    `Email: ${submission.email || 'Not provided'}`,
    '',
    submission.message,
  ].join('\n');
}

async function callOpenAI(mode, userMessage) {
  const modeGuidance = {
    askAboutMe: 'Focus on Nuwanaka\'s profile, skills, learning journey, and contact links. Be honest and student-focused.',
    projectRecommender: 'Recommend the most relevant project to review first based on the question. Explain the reasoning briefly.',
    jobMatchHelper: 'Analyze the job description or role fit. Return matching skills, relevant projects, current learning areas, and the best first project.',
  };

  const systemPrompt = [
    'You are the AI Portfolio Assistant for Nuwanaka Nadil.',
    'Only use the portfolio data provided here. Do not invent experience, companies, or achievements.',
    modeGuidance[mode],
    'Keep responses concise, professional, student-focused, and helpful.',
    'When recommending projects, prefer BidMaster for backend, database, system, and auction-related questions; PDF-Site for TypeScript; and 2YS2 for JavaScript or frontend practice.',
    'If asked about internships or junior roles, be confident but honest.',
    'If contact details are requested, return GitHub and LinkedIn links.',
    'Portfolio context follows:',
    buildPortfolioContext(),
  ].join('\n\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: openAIModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
        { role: 'user', content: [{ type: 'input_text', text: userMessage }] },
      ],
      temperature: 0.3,
      max_output_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  const outputText = typeof data.output_text === 'string' ? data.output_text.trim() : '';
  if (outputText) {
    return outputText;
  }

  return buildLocalFallback(mode, userMessage);
}

async function handleAssistantRequest(request, response) {
  try {
    const body = await readRequestBody(request);
    const payload = JSON.parse(body || '{}');
    const mode = payload.mode || 'askAboutMe';
    const message = typeof payload.message === 'string' ? payload.message : '';

    if (!message.trim()) {
      sendJson(response, 400, { error: 'Message is required.' });
      return;
    }

    const content = openAIApiKey ? await callOpenAI(mode, message) : buildLocalFallback(mode, message);
    sendJson(response, 200, { content, provider: openAIApiKey ? 'openai' : 'local-fallback', model: openAIModel });
  } catch (error) {
    const fallback = buildLocalFallback('askAboutMe', 'Tell me about Nuwanaka');
    sendJson(response, 200, {
      content: fallback,
      provider: 'local-fallback',
      model: openAIModel,
      error: error instanceof Error ? error.message : 'Unknown server error.',
    });
  }
}

async function handleContactRequest(request, response) {
  try {
    const body = await readRequestBody(request);
    const payload = JSON.parse(body || '{}');
    const name = normalizeContactField(payload.name);
    const email = normalizeContactField(payload.email);
    const message = normalizeContactField(payload.message);

    if (!message) {
      sendJson(response, 400, { error: 'Message is required.' });
      return;
    }

    const submission = {
      id: Date.now(),
      name,
      email,
      message,
      receivedAt: new Date().toISOString(),
    };

    contactInbox.unshift(submission);
    contactInbox.length = Math.min(contactInbox.length, 25);

    console.log('[assistant-server] contact submission received', submission);

    sendJson(response, 200, {
      ok: true,
      content: buildContactResponse(submission),
      submissionId: submission.id,
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown server error.',
    });
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/assistant/health') {
    sendJson(response, 200, {
      ok: true,
      provider: openAIApiKey ? 'openai' : 'local-fallback',
      model: openAIModel,
    });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/contact') {
    await handleContactRequest(request, response);
    return;
  }

  if (request.method !== 'POST' || request.url !== '/api/assistant') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  await handleAssistantRequest(request, response);
});

server.listen(serverPort, () => {
  console.log(`[assistant-server] listening on http://localhost:${serverPort}`);
});
