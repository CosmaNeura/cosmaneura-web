import { copyFile, lstat, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

for (const asset of publicAssets) {
  const source = resolve(root, asset);
  const sourceStat = await lstat(source);
  if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
    throw new Error(`Refusing non-regular public asset: ${asset}`);
  }
  await copyFile(source, resolve(output, asset));
}

console.log(`Prepared ${publicAssets.length} public assets in ${output}`);
