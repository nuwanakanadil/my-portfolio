import { Resend } from 'resend';

const MAX_MESSAGE_LENGTH = 4000;
const FROM_ADDRESS = 'Nuwanaka Nadil <onboarding@resend.dev>'; // After verifying my domain in Resend, change this to contact@nuwanakanadil-portfolio.me.

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }

  if (typeof res.writeHead === 'function') {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  } else if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = statusCode;
  }

  if (typeof res.end === 'function') {
    res.end(JSON.stringify(payload));
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatSummaryRow(label, value) {
  return `
    <tr>
      <td style="padding: 10px 0; width: 132px; color: #6b7280; font-size: 14px; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; vertical-align: top;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function buildEmailHtml({ accent, badge, title, intro, rows, messageTitle, message, footer }) {
  const summaryRows = rows.map(({ label, value }) => formatSummaryRow(label, value)).join('');

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin: 0; padding: 0; background: #0b0f14;">
        <div style="padding: 32px 16px; font-family: Arial, Helvetica, sans-serif; color: #111827;">
          <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);">
            <div style="height: 8px; background: ${accent};"></div>
            <div style="padding: 32px;">
              <div style="display: inline-block; padding: 7px 12px; border-radius: 999px; background: ${accent}1A; color: ${accent}; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
                ${escapeHtml(badge)}
              </div>
              <h1 style="margin: 16px 0 12px; font-size: 28px; line-height: 1.2; color: #111827;">${escapeHtml(title)}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #4b5563;">${escapeHtml(intro)}</p>

              <div style="border: 1px solid #e5e7eb; border-radius: 18px; background: #f9fafb; padding: 20px 22px; margin-bottom: 24px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tbody>
                    ${summaryRows}
                  </tbody>
                </table>
              </div>

              <div style="border: 1px solid #f3f4f6; border-radius: 18px; padding: 20px 22px; background: #ffffff;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${accent};">${escapeHtml(messageTitle)}</p>
                <pre style="margin: 0; white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 15px; line-height: 1.7; color: #111827; background: #f8fafc; border-radius: 14px; padding: 18px; border: 1px solid #e5e7eb;">${escapeHtml(message)}</pre>
              </div>

              <p style="margin: 22px 0 0; font-size: 13px; line-height: 1.7; color: #6b7280;">${escapeHtml(footer)}</p>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; align-items: center; gap: 14px;">
                <div style="width: 44px; height: 44px; border-radius: 999px; background: #111827; display: flex; align-items: center; justify-content: center; color: ${accent}; font-weight: 700; font-size: 18px;">N</div>
                <div>
                  <div style="font-size: 16px; font-weight: 700; color: #111827;">Nuwanaka Nadil</div>
                  <div style="font-size: 13px; color: #6b7280;">Software Engineering Undergraduate</div>
                  <div style="margin-top: 4px; font-size: 13px; color: ${accent}; font-weight: 700;">nuwanakanadil123@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function trimText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function readRequestBody(req) {
  if (req?.body !== undefined && req?.body !== null) {
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildHtmlEmail({ name, email, message }) {
  return buildEmailHtml({
    accent: '#f97316',
    badge: 'New message',
    title: 'Portfolio contact message',
    intro: 'A new message was sent through the portfolio contact form.',
    rows: [
      { label: 'Name', value: name },
      { label: 'Email', value: email },
    ],
    messageTitle: 'Message from the visitor',
    message,
    footer: 'Reply directly to this email to respond to the sender. The reply-to header is set to the visitor email address.',
  });
}

function buildSenderConfirmationEmail({ name, message }) {
  return buildEmailHtml({
    accent: '#10b981',
    badge: 'Confirmation',
    title: 'Thanks for reaching out',
    intro: 'Your message was received successfully. Nuwanaka will review it and get back to you as soon as possible.',
    rows: [
      { label: 'Name', value: name },
      { label: 'Status', value: 'Received' },
    ],
    messageTitle: 'What you sent',
    message,
    footer: 'This is an automatic confirmation from the portfolio contact form. No reply is needed unless you want to continue the conversation.',
  });
}

async function sendResendEmail(resend, emailPayload) {
  const result = await resend.emails.send(emailPayload);

  if (result.error) {
    throw new Error(result.error.message || 'Unable to send email.');
  }

  return result.data?.id || null;
}

async function handleContactRequest(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : {};

    const name = trimText(payload.name);
    const email = trimText(payload.email);
    const message = trimText(payload.message);

    if (!name || !email || !message) {
      sendJson(res, 400, { error: 'Name, email, and message are required.' });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: 'Please provide a valid email address.' });
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      sendJson(res, 400, { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.` });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (!resendApiKey) {
      sendJson(res, 500, { error: 'RESEND_API_KEY is missing.' });
      return;
    }

    if (!contactEmail) {
      sendJson(res, 500, { error: 'CONTACT_EMAIL is missing.' });
      return;
    }

    const resend = new Resend(resendApiKey);
    const adminSubject = `Portfolio contact from ${name}`;
    const confirmationSubject = 'Your message was received';
    const adminHtml = buildHtmlEmail({ name, email, message });
    const confirmationHtml = buildSenderConfirmationEmail({ name, message });
    const adminText = [
      'New portfolio contact message',
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');
    const confirmationText = [
      'Thanks for reaching out.',
      '',
      'Your message has been received and will be reviewed soon.',
      '',
      'Message copy:',
      message,
    ].join('\n');

    const [adminResult, confirmationResult] = await Promise.allSettled([
      sendResendEmail(resend, {
        from: FROM_ADDRESS,
        to: contactEmail,
        replyTo: email,
        subject: adminSubject,
        html: adminHtml,
        text: adminText,
      }),
      sendResendEmail(resend, {
        from: FROM_ADDRESS,
        to: email,
        replyTo: contactEmail,
        subject: confirmationSubject,
        html: confirmationHtml,
        text: confirmationText,
      }),
    ]);

    if (adminResult.status === 'rejected') {
      throw adminResult.reason;
    }

    const responsePayload = {
      ok: true,
      message: 'Message sent successfully.',
      id: adminResult.value,
      confirmationId: confirmationResult.status === 'fulfilled' ? confirmationResult.value : null,
    };

    if (confirmationResult.status === 'rejected') {
      responsePayload.confirmationWarning = confirmationResult.reason instanceof Error ? confirmationResult.reason.message : 'Unable to send confirmation email.';
    }

    sendJson(res, 200, responsePayload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
    sendJson(res, 500, { error: errorMessage });
  }
}

export { handleContactRequest };
export default handleContactRequest;
