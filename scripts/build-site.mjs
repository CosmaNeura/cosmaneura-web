import { copyFile, lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  capabilityStatuses,
  productCapabilities,
} from "../content/product-capabilities.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");

// Cloudflare's Git integration invokes this script for every branch build. A
// successful build of the production branch publishes immediately, so main
// must fail before dist exists. Production is built and uploaded only by the
// founder-gated GitHub workflow, where these Cloudflare build variables are
// not present. Preview branches remain available for review.
if (
  process.env.CF_PAGES === "1" &&
  (!process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH === "main")
) {
  throw new Error(
    "Automatic Cloudflare Pages production builds are disabled; use the reviewed manual production-promotion workflow.",
  );
}

const publicAssets = [
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
];

const unpublishedCatalogMarker = "<!-- PRODUCT_CAPABILITY_CATALOG -->";

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function renderAvailableCapabilityCatalog() {
  for (const capability of productCapabilities) {
    if (!capabilityStatuses[capability.status]) {
      throw new Error(
        `Unknown availability status for ${capability.key}: ${capability.status}`,
      );
    }
  }

  return productCapabilities
    .filter(({ status }) => status === "available")
    .map((capability) => {
      const statusLabel = capabilityStatuses[capability.status];

      return [
        `        <article class="tool-card" data-capability="${escapeHtml(capability.key)}" data-availability="${escapeHtml(capability.status)}">`,
        "          <div class=\"tool-card-heading\">",
        `            <h3>${escapeHtml(capability.name)}</h3>`,
        `            <span class="availability availability-${escapeHtml(capability.status)}">${escapeHtml(statusLabel)}</span>`,
        "          </div>",
        `          <p>${escapeHtml(capability.description)}</p>`,
        "        </article>",
      ].join("\n");
    })
    .join("\n");
}

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

for (const asset of publicAssets) {
  const source = resolve(root, asset);
  const sourceStat = await lstat(source);
  if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
    throw new Error(`Refusing non-regular public asset: ${asset}`);
  }

  if (asset === "index.html") {
    const template = await readFile(source, "utf8");
    const markerCount = template.split(unpublishedCatalogMarker).length - 1;
    if (markerCount !== 1) {
      throw new Error(
        `Expected one unpublished capability marker in index.html; found ${markerCount}`,
      );
    }
    const rendered = template.replace(
      unpublishedCatalogMarker,
      renderAvailableCapabilityCatalog(),
    );
    await writeFile(resolve(output, asset), rendered, "utf8");
    continue;
  }

  await copyFile(source, resolve(output, asset));
}

console.log(`Prepared ${publicAssets.length} public assets in ${output}`);
