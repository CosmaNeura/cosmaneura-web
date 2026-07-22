// Cloudflare Pages Function: POST/GET /api/checkout
// Creates a Stripe Checkout Session for the $89/mo subscription and redirects
// the visitor to Stripe's hosted checkout page. No Stripe SDK — calls the REST
// API directly so it runs on the Workers runtime with no build step.
//
// Required environment variables (set in Cloudflare Pages → Settings → Vars):
//   STRIPE_SECRET_KEY  (secret)  e.g. sk_test_... then sk_live_...
//   STRIPE_PRICE_ID              e.g. price_...  (the $89/mo recurring price)

export const onRequestGet = handle;
export const onRequestPost = handle;

async function handle({ request, env }) {
  const secret = env.STRIPE_SECRET_KEY;
  const price = env.STRIPE_PRICE_ID;

  if (!secret || !price) {
    return new Response(
      "Payments aren't configured yet. Please try again soon.",
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", price);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/?canceled=1`);
  body.set("allow_promotion_codes", "true");
  body.set("billing_address_collection", "auto");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Stripe checkout error:", detail);
    return new Response("Could not start checkout. Please try again.", { status: 502 });
  }

  const session = await res.json();
  return Response.redirect(session.url, 303);
}
