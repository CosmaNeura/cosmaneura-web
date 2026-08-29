import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const baseUrl = new URL(process.env.SITE_URL ?? "https://cosmaneura.com");
assert.equal(baseUrl.protocol, "https:", "SITE_URL must use HTTPS");

const expectedBaaHashes = new Map([
  ["/baa", "cc83a9b6eb6ff49bd6e700a40009a8ce70ce996f71d795bcaaa0a610e9dd3371"],
  ["/baa.pdf", "94da2fc53777922e23ed542a034a12ffce65e10f1436754b7421c8d35544eacc"],
  ["/baa-v2-2", "e312e78c880650bc7dc5df7f0208a427dce37879a17e3b05f311e8b4f5888be7"],
  ["/baa-v2-2.pdf", "43fe893059cf4fbd3db364e30632b35aa5716dc1a5a6759299f5cf039aceabcc"],
  ["/baa-v2-3", "afca61339b3c944b4fedf309ee73f5ee5fda3cd9a9d8aaa53a886f712ed05c12"],
  ["/baa-v2-3.pdf", "94da2fc53777922e23ed542a034a12ffce65e10f1436754b7421c8d35544eacc"],
]);

async function request(path) {
  return fetch(new URL(path, baseUrl), {
    headers: { "user-agent": "cosmas-site-release-probe/1.0" },
    redirect: "follow",
  });
}

async function expectStatus(path, expectedStatus) {
  const response = await request(path);
  assert.equal(response.status, expectedStatus, `${path}: HTTP ${response.status}`);
  return response;
}

const publicPages = [
  "/",
  "/catholic",
  "/mcd",
  "/company",
  "/baa",
  "/privacy",
  "/terms",
  "/success",
];

for (const path of publicPages) {
  const response = await expectStatus(path, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i, path);
}

for (const path of [
  `/__cosmas-release-probe-${Date.now()}`,
  "/api/checkout",
  "/api/webhook",
  "/api/book-demo",
]) {
  const response = await expectStatus(path, 404);
  assert.match(await response.text(), /Page not found — Cosmas/);
}

for (const path of [
  "/README.md",
  "/CLAUDE.md",
  "/tests/site-readiness.test.mjs",
  "/.github/workflows/uptime.yml",
]) {
  await expectStatus(path, 404);
}

const script = await expectStatus("/channel-links.js", 200);
assert.match(script.headers.get("content-type") ?? "", /javascript|ecmascript/i);

const root = await expectStatus("/", 200);
const requiredHeaders = new Map([
  ["content-security-policy", /frame-ancestors 'none'/],
  ["permissions-policy", /camera=\(\)/],
  ["strict-transport-security", /max-age=31536000/],
  ["x-content-type-options", /^nosniff$/i],
  ["x-frame-options", /^DENY$/i],
]);

for (const [name, expected] of requiredHeaders) {
  assert.match(root.headers.get(name) ?? "", expected, name);
}

const channelPages = new Map([
  ["/", "direct"],
  ["/catholic", "catholic"],
  ["/mcd", "mcd"],
]);

for (const [path, channel] of channelPages) {
  const body = await (await expectStatus(path, 200)).text();
  assert.match(
    body,
    new RegExp(`https://app\\.cosmaneura\\.com/sign-(?:in|up)\\?channel=${channel}`),
    `${path}: ${channel}`,
  );
}

const success = await (await expectStatus("/success", 200)).text();
assert.match(success, /<meta name="robots" content="noindex">/);
assert.doesNotMatch(success, /you(?:'|’)?re subscribed/i);

for (const [path, expectedHash] of expectedBaaHashes) {
  const response = await expectStatus(path, 200);
  if (!path.endsWith(".pdf")) {
    assert.match(response.headers.get("cache-control") ?? "", /\bno-transform\b/);
  }
  const hash = createHash("sha256")
    .update(Buffer.from(await response.arrayBuffer()))
    .digest("hex");
  assert.equal(hash, expectedHash, path);
}

console.log(`Live site smoke passed: ${baseUrl.origin}`);
