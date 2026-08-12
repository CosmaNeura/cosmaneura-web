// Cloudflare Pages Function: POST /api/book-demo
// Receives the "Book the demo" form, validates it, and delivers the lead.
// Two delivery paths, tried in order — configure at least one:
//   1. RESEND_API_KEY set   -> email via Resend's REST API (to LEAD_TO)
//   2. LEAD_WEBHOOK_URL set -> JSON POST (Zapier / Make / Slack-style webhook)
// No SDK — plain fetch, same as checkout.js, so it runs on the Workers
// runtime with no build step.
//
// Environment variables (Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY   (secret)  re_...   — the sending domain in LEAD_FROM must
//                                         be verified in Resend first
//   LEAD_FROM                  default "CosmaNeura <leads@cosmaneura.com>"
//   LEAD_TO                    default "john@cosmaneura.com"
//   LEAD_WEBHOOK_URL (secret)  https://hooks.zapier.com/...

export async function onRequestPost({ request, env }) {
  let fields;
  const ct = (request.headers.get("content-type") || "").toLowerCase();
  try {
    if (ct.includes("application/json")) fields = await request.json();
    else fields = Object.fromEntries((await request.formData()).entries());
  } catch {
    return reply(request, 400, "Could not read the form submission.");
  }

  // Single-line fields: collapse whitespace/newlines (defends the email
  // subject and headers), cap lengths.
  const clean = (v, max) => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  const lead = {
    first_name: clean(fields.first_name, 80),
    last_name: clean(fields.last_name, 80),
    email: clean(fields.email, 200),
    ehr: clean(fields.ehr, 80),
    message: String(fields.message ?? "").trim().slice(0, 4000),
    page: clean(request.headers.get("referer"), 200),
  };

  // Honeypot: the hidden "company" field is invisible to humans. Bots that
  // fill it get a friendly success and nothing is sent.
  if (clean(fields.company, 200)) return reply(request, 200, "ok");

  if (!lead.first_name || !lead.last_name)
    return reply(request, 422, "Please provide your first and last name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email))
    return reply(request, 422, "Please provide a valid email address.");

  const to = env.LEAD_TO || "john@cosmaneura.com";
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

  if (!env.RESEND_API_KEY && !env.LEAD_WEBHOOK_URL) {
    console.error("book-demo: no delivery path configured (RESEND_API_KEY / LEAD_WEBHOOK_URL).");
    return reply(request, 503, "Demo booking isn't configured yet. Please email john@cosmaneura.com.");
  }

  let delivered = false;

  if (env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], reply_to: lead.email, subject, text }),
    });
    if (res.ok) delivered = true;
    else console.error("Resend error:", res.status, await res.text());
  }

  if (!delivered && env.LEAD_WEBHOOK_URL) {
    const res = await fetch(env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "demo_request", subject, ...lead }),
    });
    if (res.ok) delivered = true;
    else console.error("Lead webhook error:", res.status, await res.text());
  }

  if (!delivered)
    return reply(request, 502, "Could not send your request. Please email john@cosmaneura.com.");

  return reply(request, 200, "ok");
}

// fetch() clients (Accept: application/json) get JSON; native form posts get
// a 303 redirect to the thank-you page so the form works without JavaScript.
function reply(request, status, message) {
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: status < 400, message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (status < 400) return Response.redirect(new URL("/thanks.html", request.url).toString(), 303);
  return new Response(message, { status });
}
