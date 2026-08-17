/**
 * Byte-pinned copy of CosmaNeura/cosmaneura-sovereign app/panel.js.
 *
 * Source repository: https://github.com/CosmaNeura/cosmaneura-sovereign
 * Source commit: d8ae83112b0a3e5f1f84bf071c3cb8bb92abe3e0 (merged main)
 * Source path: app/panel.js
 *
 * Updating the asset requires changing the digest, SRI, path and upstream
 * commit together and passing tests/public-panel-gate.test.js.
 */
export const PUBLIC_PANEL_SHA256 =
  "1d6e764fd6321fa565adfaa35b9cbf0d2f534599516d5649ce9e2464a45a34b9";

export const PUBLIC_PANEL_ASSET_PATH =
  `/vendor/cosmaneura-panel.v1.${PUBLIC_PANEL_SHA256}.js`;

export const PUBLIC_PANEL_INTEGRITY =
  "sha256-HW52T9YyH6VlrfqjW5y/DS9TRZlRbVZJzp4kZKRaNLk=";

export const PUBLIC_PANEL_UPSTREAM_COMMIT =
  "d8ae83112b0a3e5f1f84bf071c3cb8bb92abe3e0";
