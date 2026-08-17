import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_DEMO_BODY_BYTES,
  onRequestGet,
  onRequestPost,
} from "../functions/api/book-demo.js";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

test.beforeEach(() => {
  console.error = () => {};
});

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

const protectedEnv = {
  TURNSTILE_SITE_KEY: "site-key",
  TURNSTILE_SECRET_KEY: "secret-key",
  RESEND_API_KEY: "resend-key",
};

function valid(overrides = {}) {
  return {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@example.com",
    ehr: "Epic",
    message: "Please schedule a demo.",
    "cf-turnstile-response": "valid-token",
    ...overrides,
  };
}

function request(fields, { accept = "application/json", contentType = "form", headers = {} } = {}) {
  const requestHeaders = new Headers(headers);
  if (accept !== null) requestHeaders.set("Accept", accept);
  let body;
  if (contentType === "json") {
    requestHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(fields);
  } else if (contentType === "form") {
    requestHeaders.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    body = new URLSearchParams(fields).toString();
  } else {
    requestHeaders.set("Content-Type", contentType);
    body = String(fields);
  }
  return new Request("https://cosmaneura.com/api/book-demo", {
    method: "POST",
    headers: requestHeaders,
    body,
  });
}

function turnstileResponse(overrides = {}) {
  return new Response(
    JSON.stringify({ success: true, action: "book-demo", hostname: "cosmaneura.com", ...overrides }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function installSuccessfulDelivery(calls = []) {
  globalThis.fetch = async (url, options) => {
    calls.push([String(url), options]);
    if (String(url).includes("/siteverify")) return turnstileResponse();
    if (String(url) === "https://api.resend.com/emails") return new Response("{}", { status: 200 });
    throw new Error(`unexpected URL: ${url}`);
  };
  return calls;
}

async function responseJson(response) {
  return { status: response.status, body: await response.json() };
}

test("GET fails closed unless both Turnstile keys are configured", async () => {
  const response = await onRequestGet({ env: { TURNSTILE_SITE_KEY: "site-key" } });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("GET returns only the public Turnstile configuration", async () => {
  const response = await onRequestGet({ env: protectedEnv });
  const result = await responseJson(response);
  assert.deepEqual(result, {
    status: 200,
    body: {
      ok: true,
      turnstile_site_key: "site-key",
      turnstile_action: "book-demo",
    },
  });
  assert.equal(JSON.stringify(result).includes("secret-key"), false);
});

test("POST fails closed before parsing when Turnstile is not configured", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}");
  };
  const response = await onRequestPost({
    request: request(valid()),
    env: { RESEND_API_KEY: "resend-key" },
  });
  assert.equal(response.status, 503);
  assert.equal(called, false);
});

test("rejects non-HTTPS or credentialed webhook configuration", async (t) => {
  for (const url of ["http://hooks.example.test/lead", "https://user:pass@hooks.example.test/lead"])
    await t.test(url, async () => {
      let called = false;
      globalThis.fetch = async () => {
        called = true;
        return new Response("{}");
      };
      const response = await onRequestPost({
        request: request(valid()),
        env: {
          TURNSTILE_SITE_KEY: "site-key",
          TURNSTILE_SECRET_KEY: "secret-key",
          LEAD_WEBHOOK_URL: url,
        },
      });
      assert.equal(response.status, 503);
      assert.equal(called, false);
    });
});

test("rejects declared oversized bodies before reading or parsing", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}");
  };
  const req = request(valid(), {
    headers: { "Content-Length": String(MAX_DEMO_BODY_BYTES + 1) },
  });
  const response = await onRequestPost({ request: req, env: protectedEnv });
  assert.equal(response.status, 413);
  assert.equal(called, false);
});

test("rejects streamed bodies that exceed the cap without Content-Length", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}");
  };
  const req = request(`message=${"x".repeat(MAX_DEMO_BODY_BYTES + 1)}`, {
    contentType: "application/x-www-form-urlencoded",
  });
  req.headers.delete("content-length");
  const response = await onRequestPost({ request: req, env: protectedEnv });
  assert.equal(response.status, 413);
  assert.equal(called, false);
});

test("rejects malformed Content-Length and unsupported media types", async (t) => {
  await t.test("malformed length", async () => {
    const response = await onRequestPost({
      request: request(valid(), { headers: { "Content-Length": "not-a-number" } }),
      env: protectedEnv,
    });
    assert.equal(response.status, 400);
  });
  await t.test("unsupported media type", async () => {
    const response = await onRequestPost({
      request: request("hello", { contentType: "text/plain" }),
      env: protectedEnv,
    });
    assert.equal(response.status, 415);
  });
});

test("honeypot returns success without Turnstile or delivery calls", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("must not be called");
  };
  const response = await onRequestPost({
    request: request(valid({ company: "bot", "cf-turnstile-response": "" })),
    env: protectedEnv,
  });
  assert.equal(response.status, 200);
  assert.equal(called, false);
});

test("validates required lead fields before external calls", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}");
  };
  const response = await onRequestPost({
    request: request(valid({ first_name: "" })),
    env: protectedEnv,
  });
  assert.equal(response.status, 422);
  assert.equal(called, false);
});

test("requires a Turnstile token", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}");
  };
  const response = await onRequestPost({
    request: request(valid({ "cf-turnstile-response": "" })),
    env: protectedEnv,
  });
  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test("rejects Turnstile results for the wrong action or hostname", async (t) => {
  for (const result of [
    { action: "other" },
    { hostname: "attacker.example" },
    { success: false },
  ])
    await t.test(JSON.stringify(result), async () => {
      globalThis.fetch = async () => turnstileResponse(result);
      const response = await onRequestPost({ request: request(valid()), env: protectedEnv });
      assert.equal(response.status, 403);
    });
});

test("fails safely when Turnstile verification is unavailable", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("network unavailable");
  };
  const response = await onRequestPost({ request: request(valid()), env: protectedEnv });
  assert.equal(response.status, 503);
});

test("delivers a sanitized lead through Resend after Turnstile", async () => {
  const calls = installSuccessfulDelivery();
  const response = await onRequestPost({
    request: request(
      valid({ first_name: "Jane\r\nBcc: victim", ehr: "Epic\nInjected" }),
      { contentType: "json" },
    ),
    env: protectedEnv,
  });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  const verifyBody = calls[0][1].body;
  assert.equal(verifyBody.get("secret"), "secret-key");
  assert.equal(verifyBody.get("response"), "valid-token");
  const lead = JSON.parse(calls[1][1].body);
  assert.deepEqual(lead.to, ["info@cosmaneura.com"]);
  assert.equal(lead.reply_to, "jane@example.com");
  assert.equal(lead.subject.includes("\n"), false);
});

test("a thrown Resend request still reaches the HTTPS webhook fallback", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([String(url), options]);
    if (String(url).includes("/siteverify")) return turnstileResponse();
    if (String(url) === "https://api.resend.com/emails") throw new TypeError("network unavailable");
    if (String(url) === "https://hooks.example.test/lead") return new Response(null, { status: 204 });
    throw new Error(`unexpected URL: ${url}`);
  };
  const response = await onRequestPost({
    request: request(valid()),
    env: {
      ...protectedEnv,
      LEAD_WEBHOOK_URL: "https://hooks.example.test/lead",
    },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.map(([url]) => url), [
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    "https://api.resend.com/emails",
    "https://hooks.example.test/lead",
  ]);
});

test("returns controlled 502 when both delivery requests throw", async () => {
  globalThis.fetch = async (url) => {
    if (String(url).includes("/siteverify")) return turnstileResponse();
    throw new TypeError("network unavailable");
  };
  const response = await onRequestPost({
    request: request(valid()),
    env: {
      ...protectedEnv,
      LEAD_WEBHOOK_URL: "https://hooks.example.test/lead",
    },
  });
  assert.equal(response.status, 502);
});

test("valid native submission redirects to the same-origin thank-you page", async () => {
  installSuccessfulDelivery();
  const response = await onRequestPost({
    request: request(valid(), { accept: null }),
    env: protectedEnv,
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://cosmaneura.com/thanks.html");
});
