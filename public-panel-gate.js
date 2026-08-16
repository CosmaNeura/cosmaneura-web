const CONFIG_ENDPOINT = "/api/public-panel-config";
const PANEL_ASSET_PATH = "/embed/v1/panel.js";

export function normalizeHttpsOrigin(value) {
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

export function createEphemeralClientId(cryptoObject) {
  if (!cryptoObject) throw new Error("Secure randomness is unavailable");
  if (typeof cryptoObject.randomUUID === "function") {
    return `public-${cryptoObject.randomUUID()}`;
  }
  if (typeof cryptoObject.getRandomValues !== "function") {
    throw new Error("Secure randomness is unavailable");
  }
  const bytes = new Uint8Array(16);
  cryptoObject.getRandomValues(bytes);
  return `public-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function createPublicPanelGate(options = {}) {
  const windowObject = options.windowObject || window;
  const documentObject = options.documentObject || document;
  const fetchFunction = options.fetchFunction || windowObject.fetch.bind(windowObject);
  const cryptoObject = options.cryptoObject || windowObject.crypto;

  let activePanel = null;
  let lifecycle = 0;
  let loadedOrigin = null;
  let panelScriptPromise = null;

  function destroyActivePanel() {
    if (activePanel && typeof activePanel.destroy === "function") activePanel.destroy();
    activePanel = null;
  }

  async function loadConfiguration() {
    const response = await fetchFunction(CONFIG_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json();
    const origin = body && body.enabled === true
      ? normalizeHttpsOrigin(body.sovereign_origin)
      : null;
    return origin ? { sovereignOrigin: origin } : null;
  }

  function loadVersionedPanelAsset(sovereignOrigin) {
    if (loadedOrigin === sovereignOrigin && windowObject.CosmaNeuraPanel) {
      return Promise.resolve(windowObject.CosmaNeuraPanel);
    }
    if (loadedOrigin && loadedOrigin !== sovereignOrigin) {
      return Promise.reject(new Error("The configured Sovereign origin changed"));
    }
    if (panelScriptPromise) return panelScriptPromise;

    // Refuse a pre-existing, unverified global. The gate only trusts the exact
    // versioned asset it loaded from the configured HTTPS Sovereign origin.
    if (windowObject.CosmaNeuraPanel) {
      return Promise.reject(new Error("An unverified panel is already present"));
    }

    panelScriptPromise = new Promise((resolve, reject) => {
      const script = documentObject.createElement("script");
      script.src = `${sovereignOrigin}${PANEL_ASSET_PATH}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "strict-origin-when-cross-origin";
      script.onload = () => {
        const api = windowObject.CosmaNeuraPanel;
        if (!api || typeof api.mount !== "function") {
          script.remove();
          panelScriptPromise = null;
          reject(new Error("The versioned panel asset did not expose its mount API"));
          return;
        }
        loadedOrigin = sovereignOrigin;
        resolve(api);
      };
      script.onerror = () => {
        script.remove();
        panelScriptPromise = null;
        reject(new Error("The versioned panel asset could not be loaded"));
      };
      documentObject.head.appendChild(script);
    });
    return panelScriptPromise;
  }

  async function unlock() {
    // This is deliberately a presentation gate, not authorization or
    // entitlement. The public Sovereign deployment independently owns and
    // enforces its anonymous/free-tier mount capabilities.
    const generation = ++lifecycle;
    destroyActivePanel();

    try {
      const config = await loadConfiguration();
      if (!config || generation !== lifecycle) return false;

      const panelApi = await loadVersionedPanelAsset(config.sovereignOrigin);
      if (generation !== lifecycle) return false;

      const clientId = createEphemeralClientId(cryptoObject);
      const panel = panelApi.mount({
        sovereignUrl: config.sovereignOrigin,
        getContext: async () => ({ clientId }),
        shiftContent: false,
      });
      if (!panel || typeof panel.destroy !== "function" ||
          typeof panel.setRecord !== "function") {
        if (panel && typeof panel.destroy === "function") panel.destroy();
        return false;
      }
      if (generation !== lifecycle) {
        panel.destroy();
        return false;
      }

      activePanel = panel;
      await panel.setRecord(clientId);
      if (generation !== lifecycle || activePanel !== panel) {
        panel.destroy();
        return false;
      }
      if (typeof panel.open === "function") panel.open();
      return true;
    } catch {
      if (generation === lifecycle) destroyActivePanel();
      return false;
    }
  }

  function teardown() {
    lifecycle += 1;
    destroyActivePanel();
  }

  windowObject.addEventListener("pagehide", teardown);
  return Object.freeze({ unlock, teardown });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.CosmaNeuraPublicPanel = createPublicPanelGate();
}
