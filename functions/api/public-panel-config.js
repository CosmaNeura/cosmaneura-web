export function normalizeSovereignOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const candidate = value.trim();
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    if (candidate !== parsed.origin && candidate !== `${parsed.origin}/`) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function onRequestGet({ env }) {
  const sovereignOrigin = normalizeSovereignOrigin(env.PUBLIC_SOVEREIGN_ORIGIN);

  // This endpoint is presentation configuration only. It grants no capability
  // and issues no token; the public Sovereign deployment remains the authority.
  // A missing or invalid bare HTTPS origin is the default-off feature gate.
  const body = sovereignOrigin
    ? { enabled: true, sovereign_origin: sovereignOrigin }
    : { enabled: false };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
