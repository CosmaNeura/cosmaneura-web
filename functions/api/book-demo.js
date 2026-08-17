// Cloudflare Pages Function: GET/POST /api/book-demo
// GET exposes the non-secret Turnstile site key used by the static form.
// POST validates a bounded lead submission, verifies Turnstile, and delivers it.
//
// Required environment variables (Cloudflare Pages → Settings → Variables):
//   TURNSTILE_SITE_KEY            non-secret Cloudflare Turnstile site key
//   TURNSTILE_SECRET_KEY (secret) matching Turnstile secret key
// Configure at least one delivery path:
//   RESEND_API_KEY       (secret) email via Resend's REST API
//   LEAD_WEBHOOK_URL     (secret) HTTPS JSON webhook (Zapier / Make / similar)
// Optional:
//   LEAD_FROM                     default "CosmaNeura <leads@cosmaneura.com>"
//   LEAD_TO                       default "info@cosmaneura.com"

export const MAX_DEMO_BODY_BYTES = 32 * 1024;

const TURNSTILE_ACTION = "book-demo";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function onRequestGet({ env }) {
  const turnstile = getTurnstileConfig(env);
  if (!turnstile) {
    return jsonResponse(
      503,
      { ok: false, message: "Demo booking protection is not configured." },
      { "Cache-Control": "no-store" },
    );
  }

  return jsonResponse(
    200,
    { ok: true, turnstile_site_key: turnstile.siteKey, turnstile_action: TURNSTILE_ACTION },
    { "Cache-Control": "no-store" },
  );
}

export async function onRequestPost({ request, env }) {
  const turnstile = getTurnstileConfig(env);
  if (!turnstile) {
    console.error("book-demo: TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY are required.");
    return reply(request, 503, "Demo booking isn't configured yet. Please email info@cosmaneura.com.");
  }

  const configuredWebhook = String(env.LEAD_WEBHOOK_URL || "").trim();
  const webhookUrl = configuredWebhook ? parseHttpsUrl(configuredWebhook) : null;
  if (configuredWebhook && !webhookUrl) {
    console.error("book-demo: LEAD_WEBHOOK_URL must be an HTTPS URL without credentials.");
    return reply(request, 503, "Demo booking isn't configured yet. Please email info@cosmaneura.com.");
  }
  if (!env.RESEND_API_KEY && !webhookUrl) {
    console.error("book-demo: no delivery path configured (RESEND_API_KEY / LEAD_WEBHOOK_URL).");
    return reply(request, 503, "Demo booking isn't configured yet. Please email info@cosmaneura.com.");
  }

  let fields;
  try {
    fields = await readFields(request);
  } catch (error) {
    if (error instanceof RequestError) return reply(request, error.status, error.message);
    console.error("book-demo: request parsing failed.");
    return reply(request, 400, "Could not read the form submission.");
  }

  // Single-line fields: collapse whitespace/newlines (defends the email
  // subject and headers), then cap lengths.
  const clean = (value, max) =>
    String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  const lead = {
    first_name: clean(fields.first_name, 80),
    last_name: clean(fields.last_name, 80),
    email: clean(fields.email, 200),
    ehr: clean(fields.ehr, 80),
    message: String(fields.message ?? "").trim().slice(0, 2000),
    page: clean(request.headers.get("referer"), 200),
  };

  // Bots that fill the hidden field get a friendly success and no external call.
  if (clean(fields.company, 200)) return reply(request, 200, "ok");

  if (!lead.first_name || !lead.last_name)
    return reply(request, 422, "Please provide your first and last name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email))
    return reply(request, 422, "Please provide a valid email address.");

  const turnstileToken = clean(fields["cf-turnstile-response"], 2048);
  if (!turnstileToken)
    return reply(request, 403, "Please complete the anti-abuse check and try again.");

  const turnstileResult = await verifyTurnstile({
    request,
    secretKey: turnstile.secretKey,
    token: turnstileToken,
  });
  if (turnstileResult === "unavailable")
    return reply(request, 503, "Could not verify the submission. Please try again.");
  if (turnstileResult !== "valid")
    return reply(request, 403, "Please complete the anti-abuse check and try again.");

  const to = env.LEAD_TO || "info@cosmaneura.com";
  const from = env.LEAD_FROM || "CosmaNeura <leads@cosmaneura.com>";
  const subject =
    `Demo request — ${lead.first_name} ${lead.last_name}` + (lead.ehr ? ` (${lead.ehr})` : "");
  const text = [
    `Name:  ${lead.first_name} ${lead.last_name}`,
    `Email: ${lead.email}`,
    `EHR:   ${lead.ehr || "—"}`,
    "",
    "Message:",
    lead.message || "—",
    "",
    `Submitted from: ${lead.page || "cosmaneura.com"}`,
  ].join("\n");

  let delivered = false;

  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], reply_to: lead.email, subject, text }),
      });
      if (response.ok) delivered = true;
      else console.error("book-demo: Resend rejected delivery with status", response.status);
    } catch {
      console.error("book-demo: Resend delivery request failed.");
    }
  }

  if (!delivered && webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "demo_request", subject, ...lead }),
      });
      if (response.ok) delivered = true;
      else console.error("book-demo: lead webhook rejected delivery with status", response.status);
    } catch {
      console.error("book-demo: lead webhook request failed.");
    }
  }

  if (!delivered)
    return reply(request, 502, "Could not send your request. Please email info@cosmaneura.com.");

  return reply(request, 200, "ok");
}

async function verifyTurnstile({ request, secretKey, token }) {
  const body = new URLSearchParams({ secret: secretKey, response: token });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      console.error("book-demo: Turnstile verification returned status", response.status);
      return "unavailable";
    }
    const result = await response.json();
    const expectedHostname = new URL(request.url).hostname;
    if (
      result.success === true &&
      result.action === TURNSTILE_ACTION &&
      result.hostname === expectedHostname
    ) {
      return "valid";
    }
    return "invalid";
  } catch {
    console.error("book-demo: Turnstile verification request failed.");
    return "unavailable";
  }
}

async function readFields(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  const mediaType = contentType.split(";", 1)[0].trim();
  if (mediaType !== "application/json" && mediaType !== "application/x-www-form-urlencoded") {
    throw new RequestError(415, "Please submit JSON or URL-encoded form data.");
  }

  const bytes = await readBoundedBody(request);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new RequestError(400, "Could not read the form submission.");
  }

  if (mediaType === "application/json") {
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      throw new RequestError(400, "Could not read the form submission.");
    }
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new RequestError(400, "Could not read the form submission.");
    return value;
  }

  return Object.fromEntries(new URLSearchParams(text).entries());
}

async function readBoundedBody(request) {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const normalized = declared.trim();
    if (!/^\d+$/.test(normalized))
      throw new RequestError(400, "Invalid Content-Length header.");
    const size = Number(normalized);
    if (!Number.isSafeInteger(size) || size > MAX_DEMO_BODY_BYTES)
      throw new RequestError(413, "The form submission is too large.");
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    size += chunk.byteLength;
    if (size > MAX_DEMO_BODY_BYTES) {
      try {
        await reader.cancel("request body too large");
      } catch {
        // The 413 response is still deterministic if stream cancellation fails.
      }
      throw new RequestError(413, "The form submission is too large.");
    }
    chunks.push(chunk);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function getTurnstileConfig(env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || "").trim();
  const secretKey = String(env.TURNSTILE_SECRET_KEY || "").trim();
  return siteKey && secretKey ? { siteKey, secretKey } : null;
}

function parseHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

// Fetch clients get JSON; a native form post can still receive a same-origin
// thank-you redirect after a valid Turnstile-protected submission.
function reply(request, status, message) {
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  if (wantsJson) return jsonResponse(status, { ok: status < 400, message });
  if (status < 400) return Response.redirect(new URL("/thanks.html", request.url).toString(), 303);
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
