import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("the free-text field has an immediate, programmatically-associated no-PHI warning", () => {
  assert.match(
    index,
    /<textarea[^>]+id="msg"[^>]+aria-describedby="msg-help"[^>]*><\/textarea>\s*<p[^>]+id="msg-help"[^>]*><strong>Do not include patient information or PHI\.<\/strong>/,
  );
});

test("the marketing page does not make an unqualified HIPAA-compliance claim", () => {
  assert.doesNotMatch(index, /HIPAA compliant/i);
  assert.match(index, /PHI is accepted only in the application under an executed BAA/);
});

test("the site does not link to unreviewed legal drafts", () => {
  assert.doesNotMatch(index, /href="(?:privacy|terms)\.html"/);
});

test("the form is disabled until same-origin Turnstile configuration succeeds", () => {
  assert.match(index, /id="demo-submit"[^>]+disabled/);
  assert.match(index, /fetch\('\/api\/book-demo'/);
  assert.match(index, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
});

test("all inline JavaScript parses", () => {
  const scripts = [...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1],
  );
  assert.ok(scripts.length > 0);
  for (const source of scripts) assert.doesNotThrow(() => new Function(source));
});
