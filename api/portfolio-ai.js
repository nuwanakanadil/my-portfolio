const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'openrouter/free';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req && typeof req.body !== 'undefined' && req.body !== null) {
    if (typeof req.body === 'string') {
      return req.body;
    }

    if (Buffer.isBuffer(req.body)) {
      return req.body.toString('utf8');
    }

    if (typeof req.body === 'object') {
      return JSON.stringify(req.body);
    }
  }

  return await new Promise((resolve, reject) => {
    let body = '';

    if (!req || typeof req.on !== 'function') {
      resolve('');
      return;
    }

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildSystemPrompt() {
  return [
    'The assistant is for Nuwanaka Nadil\'s software engineering portfolio.',
    'Answer only using portfolio data.',
    'Do not invent fake experience, fake companies, or fake achievements.',
    'Be honest, student-developer focused, and professional.',
    '',
    'Portfolio data:',
    'Name: Nuwanaka Nadil',
    'Role: Software Engineering Undergraduate',
    'University: SLIIT',
    'Location: Gampaha, Sri Lanka',
    'Focus areas: Web Development, Software Engineering, Backend Systems, Full-stack development',
    'Currently learning: Laravel and Vue.js',
    'Skills: Java, PHP, JavaScript, TypeScript, HTML, CSS, React, Vue.js, Laravel, MySQL, Git, GitHub, VS Code',
    'Projects:',
    '- BidMaster: Online auction system, PHP, best for backend logic, database usage, and practical web application development',
    '- PDF-Site: TypeScript-based web project, best for TypeScript and web development practice',
    '- 2YS2: JavaScript project, best for JavaScript learning and project work',
    '- Demo: TypeScript project, best for experimentation and learning',
    'Links:',
    'GitHub: https://github.com/nuwanakanadil',
    'LinkedIn: https://www.linkedin.com/in/nuwanaka-nadil-9145442a5/',
  ].join('\n');
}

function extractAnswer(data) {
  const choices = Array.isArray(data?.choices) ? data.choices : [];
  const firstChoice = choices[0];
  const messageContent = firstChoice?.message?.content;

  if (typeof messageContent === 'string') {
    return messageContent.trim();
  }

  if (Array.isArray(messageContent)) {
    const text = messageContent
      .map((item) => (typeof item?.text === 'string' ? item.text : ''))
      .join('')
      .trim();

    if (text) {
      return text;
    }
  }

  const fallbackText = typeof data?.output_text === 'string' ? data.output_text.trim() : '';
  return fallbackText;
}

async function handlePortfolioAiRequest(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const mode = normalizeText(payload.mode) || 'askAboutMe';
    const message = normalizeText(payload.message);

    if (!message) {
      sendJson(res, 400, { error: 'Message is required.' });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: 'OpenRouter API key is missing.' });
      return;
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = [
      `Assistant mode: ${mode}`,
      `User message: ${message}`,
    ].join('\n');

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://nuwanakanadil-portfolio.me',
        'X-OpenRouter-Title': 'Nuwanaka Nadil Portfolio',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    const responseText = await response.text();
    let data = null;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || responseText || 'OpenRouter request failed.';
      sendJson(res, response.status, { error: errorMessage });
      return;
    }

    const answer = extractAnswer(data);
    if (!answer) {
      sendJson(res, 502, { error: 'OpenRouter returned an empty response.' });
      return;
    }

    sendJson(res, 200, { answer });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
    sendJson(res, 500, { error: errorMessage });
  }
}

export { handlePortfolioAiRequest };
export default handlePortfolioAiRequest;
