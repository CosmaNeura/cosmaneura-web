export function normalizeSovereignOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function onRequestGet({ env }) {
  const explicitlyEnabled = String(env.PUBLIC_SOVEREIGN_PANEL_ENABLED || "").toLowerCase() === "true";
  const sovereignOrigin = normalizeSovereignOrigin(env.PUBLIC_SOVEREIGN_ORIGIN);

  // This endpoint is presentation configuration only. It grants no capability
  // and issues no token; the public Sovereign deployment remains the authority.
  const body = explicitlyEnabled && sovereignOrigin
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
