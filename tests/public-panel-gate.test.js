import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createEphemeralClientId,
  createPublicPanelGate,
  normalizeHttpsOrigin,
} from "../public-panel-gate.js";
import {
  normalizeSovereignOrigin,
  onRequestGet,
} from "../functions/api/public-panel-config.js";

function response(body, ok = true) {
  return { ok, json: async () => body };
}

function harness(config = {
  enabled: true,
  sovereign_origin: "https://public-sovereign.example",
}) {
  const calls = { fetch: [], scripts: [], mounts: [], destroyed: [], setRecords: [], opened: 0 };
  const listeners = new Map();
  let id = 0;
  const windowObject = {
    crypto: { randomUUID: () => `00000000-0000-4000-8000-${String(++id).padStart(12, "0")}` },
    fetch: async (...args) => {
      calls.fetch.push(args);
      return response(config);
    },
    addEventListener: (name, handler) => listeners.set(name, handler),
  };
  const documentObject = {
    createElement: (tag) => {
      assert.equal(tag, "script");
      return { remove() { this.removed = true; } };
    },
    head: {
      appendChild: (script) => {
        calls.scripts.push(script);
        windowObject.CosmaNeuraPanel = {
          mount: (options) => {
            calls.mounts.push(options);
            const panel = {
              destroy: () => calls.destroyed.push(panel),
              setRecord: async (record) => calls.setRecords.push(record),
              open: () => { calls.opened += 1; },
            };
            return panel;
          },
        };
        queueMicrotask(() => script.onload());
      },
    },
  };
  const gate = createPublicPanelGate({
    windowObject,
    documentObject,
    fetchFunction: windowObject.fetch,
    cryptoObject: windowObject.crypto,
  });
  return { calls, gate, listeners, windowObject };
}

test("the versioned panel is not requested or mounted before the gate is unlocked", () => {
  const { calls } = harness();
  assert.deepEqual(calls.fetch, []);
  assert.deepEqual(calls.scripts, []);
  assert.deepEqual(calls.mounts, []);
});

test("the page unlocks only inside the existing successful lead response branch", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const successGuard = html.indexOf("if (!res.ok || !data.ok)");
  const successReplacement = html.indexOf("Request received ✓");
  const unlock = html.indexOf("window.CosmaNeuraPublicPanel.unlock()");

  assert.notEqual(successGuard, -1);
  assert.ok(successReplacement > successGuard);
  assert.ok(unlock > successReplacement);
  assert.match(html, /<script type="module" src="\/public-panel-gate\.js"><\/script>/);
  assert.doesNotMatch(html, /src="\/panel\.js"/);
});

test("unlock loads only the versioned HTTPS asset and passes no lead PII or token", async () => {
  const { calls, gate } = harness();
  assert.equal(await gate.unlock(), true);

  assert.equal(calls.fetch.length, 1);
  assert.equal(calls.fetch[0][0], "/api/public-panel-config");
  assert.equal(calls.scripts.length, 1);
  assert.equal(calls.scripts[0].src, "https://public-sovereign.example/embed/v1/panel.js");
  assert.equal(calls.mounts.length, 1);

  const options = calls.mounts[0];
  assert.equal(options.sovereignUrl, "https://public-sovereign.example");
  assert.equal(options.shiftContent, false);
  assert.equal(Object.hasOwn(options, "getAuthToken"), false);
  assert.equal(Object.hasOwn(options, "loadHistory"), false);
  assert.equal(Object.hasOwn(options, "saveHistory"), false);
  const context = await options.getContext();
  assert.deepEqual(Object.keys(context), ["clientId"]);
  assert.match(context.clientId, /^public-[0-9a-f-]+$/);
  assert.deepEqual(calls.setRecords, [context.clientId]);
  assert.equal(calls.opened, 1);
});

test("disabled or non-HTTPS configuration fails closed", async () => {
  const disabled = harness({ enabled: false });
  assert.equal(await disabled.gate.unlock(), false);
  assert.equal(disabled.calls.scripts.length, 0);
  assert.equal(disabled.calls.mounts.length, 0);

  const insecure = harness({ enabled: true, sovereign_origin: "http://sovereign.example" });
  assert.equal(await insecure.gate.unlock(), false);
  assert.equal(insecure.calls.scripts.length, 0);
  assert.equal(insecure.calls.mounts.length, 0);
});

test("a second unlock tears down and remounts with a new ephemeral client id", async () => {
  const { calls, gate } = harness();
  assert.equal(await gate.unlock(), true);
  const first = calls.setRecords[0];
  assert.equal(await gate.unlock(), true);
  const second = calls.setRecords[1];

  assert.notEqual(first, second);
  assert.equal(calls.destroyed.length, 1);
  assert.equal(calls.mounts.length, 2);
});

test("pagehide cleanly destroys the mounted panel", async () => {
  const { calls, gate, listeners } = harness();
  assert.equal(await gate.unlock(), true);
  listeners.get("pagehide")();
  assert.equal(calls.destroyed.length, 1);
});

test("ephemeral ids require browser-grade randomness", () => {
  assert.throws(() => createEphemeralClientId({}), /Secure randomness/);
  const id = createEphemeralClientId({
    getRandomValues(bytes) { bytes.fill(0xab); return bytes; },
  });
  assert.equal(id, `public-${"ab".repeat(16)}`);
});

test("origin validation accepts only a bare HTTPS origin", () => {
  for (const normalize of [normalizeHttpsOrigin, normalizeSovereignOrigin]) {
    assert.equal(normalize("https://sovereign.example/"), "https://sovereign.example");
    assert.equal(normalize("http://sovereign.example"), null);
    assert.equal(normalize("https://user:pass@sovereign.example"), null);
    assert.equal(normalize("https://sovereign.example/path"), null);
    assert.equal(normalize("https://sovereign.example/?mode=public"), null);
  }
});

test("the config function defaults off and exposes only validated presentation config", async () => {
  const off = onRequestGet({ env: {} });
  assert.equal(off.status, 200);
  assert.deepEqual(await off.json(), { enabled: false });
  assert.equal(off.headers.get("cache-control"), "no-store");

  const invalid = onRequestGet({
    env: { PUBLIC_SOVEREIGN_PANEL_ENABLED: "true", PUBLIC_SOVEREIGN_ORIGIN: "http://bad.example" },
  });
  assert.deepEqual(await invalid.json(), { enabled: false });

  const on = onRequestGet({
    env: {
      PUBLIC_SOVEREIGN_PANEL_ENABLED: "true",
      PUBLIC_SOVEREIGN_ORIGIN: "https://public-sovereign.example/",
    },
  });
  assert.deepEqual(await on.json(), {
    enabled: true,
    sovereign_origin: "https://public-sovereign.example",
  });
});
