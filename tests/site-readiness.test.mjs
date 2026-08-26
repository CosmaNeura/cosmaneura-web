import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const readBytes = (path) => readFileSync(join(root, path));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const htmlPages = readdirSync(root)
  .filter((path) => path.endsWith(".html"))
  .sort();

const publicFiles = new Map([
  ["/", "index.html"],
  ["/404", "404.html"],
  ["/baa", "baa.html"],
  ["/baa.pdf", "baa.pdf"],
  ["/catholic", "catholic.html"],
  ["/company", "company.html"],
  ["/mcd", "mcd.html"],
  ["/privacy", "privacy.html"],
  ["/success", "success.html"],
  ["/terms", "terms.html"],
  ["/apple-touch-icon.png", "apple-touch-icon.png"],
  ["/channel-links.js", "channel-links.js"],
  ["/favicon.svg", "favicon.svg"],
  ["/og.png", "og.png"],
  ["/robots.txt", "robots.txt"],
  ["/sitemap.xml", "sitemap.xml"],
  ["/styles.css", "styles.css"],
]);

function changeBudgetScript() {
  const source = read(".github/workflows/change-budget.yml");
  const marker = "        run: |\n";
  const start = source.indexOf(marker);

  assert.notEqual(start, -1, "change-budget workflow must contain an inline script");
  return source
    .slice(start + marker.length)
    .split("\n")
    .map((line) => line.replace(/^ {10}/, ""))
    .join("\n");
}

function runChangeBudget({ additions, deletions, changedFiles }) {
  const directory = mkdtempSync(join(tmpdir(), "cosmaneura-change-budget-"));
  const environment = {
    ...process.env,
    ADDITIONS: additions,
    DELETIONS: deletions,
    CHANGED_FILES: changedFiles,
    MAX_CHANGED_LINES: "2000",
    MAX_CHANGED_FILES: "50",
    GITHUB_STEP_SUMMARY: join(directory, "summary.md"),
  };

  for (const name of ["ADDITIONS", "DELETIONS", "CHANGED_FILES"]) {
    if (environment[name] === undefined) delete environment[name];
  }

  try {
    return spawnSync("bash", ["-c", changeBudgetScript()], {
      cwd: root,
      encoding: "utf8",
      env: environment,
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

function hrefs(html) {
  return [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
}

function relativeLuminance(hex) {
  const channels = hex
    .match(/[a-f\d]{2}/gi)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function themeColors(css, token) {
  return [...css.matchAll(new RegExp(`--${token}:\\s*(#[a-f\\d]{6})`, "gi"))].map(
    (match) => match[1],
  );
}

test("Cloudflare Pages has an explicit, non-indexed 404 document", () => {
  const notFound = read("404.html");

  assert.match(notFound, /<title>Page not found — Cosmas<\/title>/);
  assert.match(notFound, /<meta name="robots" content="noindex">/);
  assert.match(notFound, /<a href="\/" class="btn btn-primary">Return to Cosmas<\/a>/);
  assert.doesNotMatch(notFound, /rel="canonical"/);
});

test("internal links and same-origin assets resolve to checked-in files", () => {
  for (const page of htmlPages) {
    const html = read(page);

    for (const href of hrefs(html)) {
      if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;

      if (href.startsWith("#")) {
        const id = href.slice(1);
        assert.match(html, new RegExp(`\\bid="${id}"`), `${page}: ${href}`);
        continue;
      }

      const pathname = href.split(/[?#]/, 1)[0];
      const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
      const target = publicFiles.get(normalized);

      assert.ok(target, `${page}: unrecognized internal link ${href}`);
      assert.ok(existsSync(join(root, target)), `${page}: missing ${target}`);
      assert.doesNotMatch(href, /\.html(?:[?#]|$)/, `${page}: use the pretty URL`);
      assert.doesNotMatch(href, /^\/api\//, `${page}: retired API path`);
    }
  }
});

test("three-door app links preserve the source channel", () => {
  const expectedChannels = new Map([
    ["index.html", "direct"],
    ["catholic.html", "catholic"],
    ["mcd.html", "mcd"],
    ["company.html", "direct"],
    ["privacy.html", "direct"],
    ["terms.html", "direct"],
    ["success.html", "direct"],
  ]);

  for (const [page, expectedChannel] of expectedChannels) {
    const appLinks = hrefs(read(page)).filter((href) =>
      href.startsWith("https://app.cosmaneura.com/sign-"),
    );

    assert.ok(appLinks.length > 0, `${page}: expected at least one app link`);
    for (const href of appLinks) {
      assert.equal(new URL(href).searchParams.get("channel"), expectedChannel, href);
    }
  }

  const success = read("success.html");
  const channelScript = read("channel-links.js");
  assert.match(success, /data-preserve-channel/);
  assert.match(channelScript, /\["direct", "catholic", "mcd"\]/);
  assert.doesNotMatch(channelScript, /location\.search\s*\+/);
});

test("public pages expose one main landmark and visible keyboard focus", () => {
  for (const page of htmlPages.filter((path) => path !== "baa.html")) {
    const html = read(page);
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, page);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, page);

    if (html.includes("<nav")) {
      assert.match(html, /<nav aria-label="Primary">/, page);
      assert.match(html, /<a class="skip-link" href="#main-content">/, page);
    }
    if (html.includes("<footer")) {
      assert.match(html, /<nav class="foot-links" aria-label="Footer">/, page);
    }
  }

  const css = read("styles.css");
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.skip-link:focus/);
});

test("foreground, button, and focus colors meet WCAG contrast thresholds", () => {
  const css = read("styles.css");
  const tokens = Object.fromEntries(
    ["paper", "surface", "blue-deep", "button-bg", "focus-ring"].map(
      (token) => [token, themeColors(css, token)],
    ),
  );

  for (const [token, values] of Object.entries(tokens)) {
    assert.equal(values.length, 2, `${token} must define light and dark values`);
  }

  const themes = [0, 1].map((index) => ({
    paper: tokens.paper[index],
    surface: tokens.surface[index],
    text: tokens["blue-deep"][index],
    button: tokens["button-bg"][index],
    focus: tokens["focus-ring"][index],
  }));

  for (const theme of themes) {
    assert.ok(contrast(theme.text, theme.paper) >= 4.5, theme);
    assert.ok(contrast("#FFFFFF", theme.button) >= 4.5, theme);
    assert.ok(contrast(theme.focus, theme.paper) >= 3, theme);
    assert.ok(contrast(theme.focus, theme.surface) >= 3, theme);
  }
});

test("canonical metadata, sitemap, and robots cover the indexable pages", () => {
  const indexablePages = new Map([
    ["index.html", "https://cosmaneura.com/"],
    ["catholic.html", "https://cosmaneura.com/catholic"],
    ["mcd.html", "https://cosmaneura.com/mcd"],
    ["company.html", "https://cosmaneura.com/company"],
    ["baa.html", "https://cosmaneura.com/baa"],
    ["privacy.html", "https://cosmaneura.com/privacy"],
    ["terms.html", "https://cosmaneura.com/terms"],
  ]);

  for (const [page, canonical] of indexablePages) {
    const html = read(page);
    assert.match(html, /<meta name="description" content="[^"]+">/, page);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), page);
    assert.ok(html.includes(`<meta property="og:url" content="${canonical}">`), page);
    assert.match(html, /<meta property="og:image" content="https:\/\/cosmaneura\.com\/og\.png">/, page);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, page);
  }

  const sitemap = read("sitemap.xml");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(sitemapUrls, [...indexablePages.values()].sort());
  assert.match(
    sitemap,
    /<loc>https:\/\/cosmaneura\.com\/baa<\/loc><lastmod>2026-08-20<\/lastmod>/,
  );
  assert.equal((sitemap.match(/<lastmod>2026-08-21<\/lastmod>/g) ?? []).length, 6);

  const robots = read("robots.txt");
  assert.doesNotMatch(robots, /^Disallow: \/success$/m);
  assert.match(robots, /^Sitemap: https:\/\/cosmaneura\.com\/sitemap\.xml$/m);
  assert.match(read("success.html"), /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(read("success.html"), /rel="canonical"/);
});

test("the marketing site stays static and functions-free", () => {
  assert.equal(existsSync(join(root, "functions")), false);
  assert.equal(existsSync(join(root, "_worker.js")), false);
  assert.equal(existsSync(join(root, "wrangler.toml")), false);
  assert.equal(existsSync(join(root, "wrangler.json")), false);
  assert.equal(existsSync(join(root, "wrangler.jsonc")), false);
  assert.equal(existsSync(join(root, ".dev.vars.example")), false);

  const gitignore = read(".gitignore");
  for (const ignored of [
    ".DS_Store",
    "node_modules/",
    ".dev.vars",
    ".wrangler/",
    "dist/",
    ".env",
    ".env.*",
  ]) {
    assert.ok(gitignore.split("\n").includes(ignored), ignored);
  }

  const readme = read("README.md");
  assert.match(readme, /requires no Pages Functions,\s+Worker, or runtime/);
  assert.match(readme, /retired `\/api\/\*` paths/);
});

test("the public build contains only the reviewed asset allowlist", () => {
  assert.match(read("scripts/build-site.mjs"), /lstat\(source\)/);
  assert.match(read("scripts/build-site.mjs"), /sourceStat\.isSymbolicLink\(\)/);
  const output = join(root, "dist");

  try {
    const build = spawnSync(process.execPath, [join(root, "scripts/build-site.mjs")], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(build.status, 0, build.stderr);
    assert.deepEqual(readdirSync(output).sort(), [
      "404.html",
      "_headers",
      "_redirects",
      "apple-touch-icon.png",
      "baa.html",
      "baa.pdf",
      "catholic.html",
      "channel-links.js",
      "company.html",
      "favicon.svg",
      "index.html",
      "mcd.html",
      "og.png",
      "privacy.html",
      "robots.txt",
      "sitemap.xml",
      "styles.css",
      "success.html",
      "terms.html",
    ]);
  } finally {
    rmSync(output, { force: true, recursive: true });
  }
});

test("automatic Cloudflare production builds fail closed before creating dist", () => {
  const output = join(root, "dist");
  const buildScript = join(root, "scripts/build-site.mjs");
  const cleanEnvironment = { ...process.env };
  delete cleanEnvironment.CF_PAGES;
  delete cleanEnvironment.CF_PAGES_BRANCH;
  delete cleanEnvironment.CF_PAGES_COMMIT_SHA;
  delete cleanEnvironment.CF_PAGES_URL;

  try {
    rmSync(output, { force: true, recursive: true });
    const blocked = spawnSync(process.execPath, [buildScript], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...cleanEnvironment,
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "main",
        CF_PAGES_COMMIT_SHA: "a".repeat(40),
      },
    });
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /Automatic Cloudflare Pages production builds are disabled/);
    assert.equal(existsSync(output), false);

    const missingBranch = spawnSync(process.execPath, [buildScript], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...cleanEnvironment,
        CF_PAGES: "1",
        CF_PAGES_COMMIT_SHA: "b".repeat(40),
      },
    });
    assert.notEqual(missingBranch.status, 0);
    assert.equal(existsSync(output), false);

    const preview = spawnSync(process.execPath, [buildScript], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...cleanEnvironment,
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "codex/manual-production-promotion",
        CF_PAGES_COMMIT_SHA: "c".repeat(40),
      },
    });
    assert.equal(preview.status, 0, preview.stderr);
    assert.ok(existsSync(output));
  } finally {
    rmSync(output, { force: true, recursive: true });
  }
});

test("pull requests run readiness checks without exhausting the uptime budget", () => {
  const readiness = read(".github/workflows/site-readiness.yml");
  const uptime = read(".github/workflows/uptime.yml");

  assert.match(readiness, /^\s*pull_request:/m);
  assert.match(readiness, /node --test tests\/site-readiness\.test\.mjs/);
  assert.match(readiness, /node --check channel-links\.js/);
  assert.match(readiness, /node --check scripts\/build-site\.mjs/);
  assert.match(readiness, /node scripts\/build-site\.mjs/);
  assert.match(readiness, /node --check scripts\/smoke-live\.mjs/);
  assert.match(uptime, /cron: "17 \*\/6 \* \* \*"/);
  assert.doesNotMatch(uptime, /\*\/15/);
});

test("change budget uses trusted metadata with fixed, waiver-free limits", () => {
  const workflow = read(".github/workflows/change-budget.yml");
  const trigger = workflow.slice(0, workflow.indexOf("permissions:"));

  assert.match(trigger, /^\s*pull_request_target:/m);
  assert.doesNotMatch(trigger, /^\s*pull_request:/m);
  assert.doesNotMatch(trigger, /workflow_dispatch/);
  assert.match(workflow, /^permissions: \{\}$/m);
  assert.match(
    workflow,
    /^\s*ADDITIONS: \$\{\{ github\.event\.pull_request\.additions \}\}$/m,
  );
  assert.match(
    workflow,
    /^\s*DELETIONS: \$\{\{ github\.event\.pull_request\.deletions \}\}$/m,
  );
  assert.match(
    workflow,
    /^\s*CHANGED_FILES: \$\{\{ github\.event\.pull_request\.changed_files \}\}$/m,
  );
  assert.match(workflow, /^\s*MAX_CHANGED_LINES: '2000'$/m);
  assert.match(workflow, /^\s*MAX_CHANGED_FILES: '50'$/m);
  assert.doesNotMatch(workflow, /^\s*uses:/m);
  assert.doesNotMatch(workflow, /checkout|github\.event\.pull_request\.head/i);
  assert.doesNotMatch(workflow, /\bsecrets\./);

  for (const waiver of ["label", "checkbox", "admin", "continue-on-error"]) {
    assert.doesNotMatch(workflow, new RegExp(waiver, "i"));
  }
});

test("change budget accepts the exact line and file boundaries", () => {
  for (const metrics of [
    { additions: "2000", deletions: "0", changedFiles: "50" },
    { additions: "1000", deletions: "1000", changedFiles: "50" },
    { additions: "0", deletions: "0", changedFiles: "0" },
  ]) {
    const result = runChangeBudget(metrics);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("change budget rejects changes above either limit", () => {
  for (const metrics of [
    { additions: "2001", deletions: "0", changedFiles: "50" },
    { additions: "1000", deletions: "1001", changedFiles: "50" },
    { additions: "2000", deletions: "0", changedFiles: "51" },
  ]) {
    const result = runChangeBudget(metrics);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /too large for one reliable review/);
  }
});

test("change budget fails closed on missing, malformed, or negative metrics", () => {
  const valid = {
    additions: "1",
    deletions: "1",
    changedFiles: "1",
  };

  for (const field of Object.keys(valid)) {
    for (const invalidValue of [undefined, "not-a-number", "-1"]) {
      const metrics = { ...valid, [field]: invalidValue };
      const result = runChangeBudget(metrics);

      assert.notEqual(result.status, 0, `${field}=${invalidValue}`);
      assert.match(result.stdout, /Missing or invalid pull-request metric/);
    }
  }
});

test("production promotion is manual, founder-only, reviewed, and commit-bound", () => {
  const workflow = read(".github/workflows/promote-production.yml");
  const promotion = read("docs/PRODUCTION_PROMOTION.md");

  assert.match(workflow, /^\s*workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^\s*(?:push|pull_request|schedule):/m);
  assert.match(workflow, /test "\$ACTOR" = "JohnClem"/);
  assert.match(workflow, /test "\$TRIGGERING_ACTOR" = "JohnClem"/);
  assert.match(workflow, /test "\$WORKFLOW_REF" = "refs\/heads\/main"/);
  assert.match(workflow, /Independent agent review: PASS/);
  assert.match(workflow, /Reviewed commit: \$RELEASE_SHA/);
  assert.match(workflow, /git\/ref\/heads\/main/);
  assert.equal((workflow.match(/git\/ref\/heads\/main/g) ?? []).length, 2);
  assert.match(workflow, /preCommands:/);
  assert.match(workflow, /api\.cloudflare\.com\/client\/v4\/accounts/);
  assert.match(workflow, /\.result\.production_branch == "main"/);
  assert.match(workflow, /cloudflare\/wrangler-action@[0-9a-f]{40}/);
  assert.match(workflow, /--commit-hash=\$\{\{ inputs\.release_sha \}\}/);
  assert.match(promotion, /Agent review is evidence, not a\s+GitHub approval/);
  assert.match(promotion, /environment is an audit boundary, not a claim/);
  assert.match(promotion, /deployment\s+branches to `main`/);
});

test("Cloudflare Pages configuration adds safe headers without rewrites", () => {
  const headers = read("_headers");
  const redirects = read("_redirects");
  const redirectRules = redirects
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .join("\n");

  assert.match(headers, /Content-Security-Policy:/);
  assert.match(
    headers,
    /script-src 'self' 'sha256-dc8cPV\/R6wgeX0EBprDm\/tVcIthSDl9kg\/lB0FFEsXs='/,
  );
  assert.doesNotMatch(headers, /script-src[^;]*'unsafe-inline'/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /Permissions-Policy:/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
  assert.match(headers, /Strict-Transport-Security: max-age=31536000/);
  assert.match(
    headers,
    /\/baa\n\s+Cache-Control: public, max-age=0, must-revalidate, no-transform/,
  );
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.doesNotMatch(redirectRules, /\s200(?:\s|$)/m);
  assert.doesNotMatch(redirectRules, /\.html\s/m);
});

test("README identifies the canonical BAA without calling it a draft", () => {
  const readme = read("README.md");

  assert.match(readme, /Counsel-approved CN-BAA-CUST-CW v2\.2/);
  assert.doesNotMatch(readme, /Draft BAA \(UX; counsel must ratify\)/);
  assert.match(readme, /must not be edited in\s+place/);
});

test("repository guidance reflects the static, app-owned billing architecture", () => {
  const guidance = read("CLAUDE.md");

  assert.match(guidance, /cosmaneura-architecture/);
  assert.match(guidance, /no Pages Functions, Worker, runtime secrets/);
  assert.match(guidance, /main `cosmaneura` application/);
  assert.match(guidance, /Never\s+edit canonical agreement bytes in place/);
  assert.match(guidance, /Cloudflare Web Analytics\s+Automatic Setup/);
  assert.match(guidance, /PostHog or any broader measurement requires/);
  assert.doesNotMatch(guidance, /subscriber.*console\.log/i);
  assert.doesNotMatch(guidance, /functions\/api\/checkout/);
});

test("public copy no longer calls the counsel-approved BAA a draft", () => {
  for (const page of ["index.html", "company.html", "baa.html"]) {
    assert.doesNotMatch(read(page), /draft BAA/i, page);
  }
});

test("public copy does not promise unverified or inactive features", () => {
  const publicCopy = ["index.html", "catholic.html", "mcd.html", "company.html"]
    .map(read)
    .join("\n");

  assert.doesNotMatch(publicCopy, /2\.4 hrs/i);
  assert.doesNotMatch(publicCopy, /English, Spanish & Mandarin/i);
  assert.doesNotMatch(publicCopy, /coding queue|queues coding/i);
  assert.doesNotMatch(publicCopy, /cancel anytime/i);
  assert.doesNotMatch(publicCopy, /invite-only|MCD invite/i);
  assert.doesNotMatch(publicCopy, /MCD has on file/i);
  assert.doesNotMatch(publicCopy, /parish (?:correspondence|pathways)/i);
  assert.doesNotMatch(publicCopy, /NFP and fertility/i);
  assert.match(read("mcd.html"), /Limited Cosmas rollout for MyCatholicDoctor work-email users/);
});

test("the pastoral pack is clearly presented as unavailable and coming soon", () => {
  const catholic = read("catholic.html");

  assert.match(catholic, /<h3>Pastoral pack<\/h3>/);
  assert.match(catholic, /<strong>Coming soon\.<\/strong>/);
  assert.match(catholic, /not available today/i);
  assert.doesNotMatch(catholic, /pastoral pack is (?:on|available)/i);
  assert.doesNotMatch(catholic, /pastoral pack is an entitlement you turn on/i);
});

test("the custom-numbered MCD rollout retains list semantics", () => {
  assert.match(read("mcd.html"), /<ol class="rollout" role="list">/);
  assert.match(read("index.html"), /<ul class="price-feats" role="list">/);
});

test("canonical BAA HTML, article, and PDF bytes remain pinned", () => {
  const baaHtml = read("baa.html");
  const article = baaHtml.match(
    /<article class="cn-baa"[^>]*>[\s\S]*?<\/article>/,
  );

  assert.ok(article, "canonical BAA article is present");
  assert.equal(
    sha256(readBytes("baa.html")),
    "7f99117742c5f68b854d91fd09131c70f5c80c6e915350ffada34de98a4485d0",
  );
  assert.equal(
    sha256(article[0]),
    "182c9946296fc78e5eb9b094d7183eeafb48a24962e153d83a7be7afeaf3216b",
  );
  assert.equal(
    sha256(readBytes("baa.pdf")),
    "43fe893059cf4fbd3db364e30632b35aa5716dc1a5a6759299f5cf039aceabcc",
  );
});
