// Cloudflare Pages Function: POST /api/webhook
// Receives Stripe webhook events, verifies the signature, and reacts to
// subscription lifecycle events. Phase 1 just records who paid (so we can grant
// the CosmaNeura app login manually); Phase 2 will auto-provision the account.
//
// Required environment variable:
//   STRIPE_WEBHOOK_SECRET  (secret)  e.g. whsec_...  (from the Stripe webhook endpoint)

export async function onRequestPost({ request, env }) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature") || "";
  const payload = await request.text();

  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET not set — rejecting webhook.");
    return new Response("Webhook not configured", { status: 503 });
  }

  const valid = await verifySignature(payload, signature, secret);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const email = s.customer_details && s.customer_details.email;
      console.log(
        `New subscriber → email=${email} customer=${s.customer} subscription=${s.subscription}`
      );
      // Phase 2: create/activate the CosmaNeura app login for this customer here.
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      console.log(`Subscription canceled → customer=${sub.customer}`);
      // Phase 2: revoke the app login here.
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      console.log(`Payment failed → customer=${inv.customer}`);
      break;
    }
    default:
      // ignore other event types
      break;
  }

  return new Response("ok", { status: 200 });
}

// Verify Stripe's `Stripe-Signature` header using Web Crypto (HMAC-SHA256).
async function verifySignature(payload, header, secret) {
  const parts = {};
  header.split(",").forEach((kv) => {
    const [k, v] = kv.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });

  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;

  // Reject events older than 5 minutes (replay protection).
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  const actual = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
