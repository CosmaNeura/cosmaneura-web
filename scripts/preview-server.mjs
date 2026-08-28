import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

function artifactPath(pathname) {
  if (pathname === "/") return "index.html";
  if (!pathname.startsWith("/") || pathname.includes("\\")) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(pathname.slice(1));
  } catch {
    return null;
  }

  if (!decoded || decoded.includes("/") || decoded.startsWith(".")) return null;
  return extname(decoded) ? decoded : `${decoded}.html`;
}

export function createPreviewServer({ artifactRoot = resolve(repositoryRoot, "dist") } = {}) {
  const notFoundPath = resolve(artifactRoot, "404.html");

  return createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const pathname = new URL(request.url ?? "/", "http://preview.invalid").pathname;
    const relativePath = artifactPath(pathname);

    try {
      if (!relativePath) throw new Error("Unknown preview path");
      const body = await readFile(resolve(artifactRoot, relativePath));
      response.writeHead(200, {
        "Content-Type": contentTypes.get(extname(relativePath)) ?? "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      const body = await readFile(notFoundPath);
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : body);
    }
  });
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const port = Number.parseInt(process.env.PORT ?? "4173", 10);
  const server = createPreviewServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`Cosmas preview: http://127.0.0.1:${port}`);
  });
}
