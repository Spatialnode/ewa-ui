#!/usr/bin/env node
// maplibre-gl ships its web worker as two ESM files (maplibre-gl-worker.mjs
// importing maplibre-gl-shared.mjs) and locates them at runtime via a URL
// relative to its own bundled location. Bundlers can't statically detect
// that lookup, so the worker never gets copied into a build automatically.
//
// We vendor a *self-contained* bundle of the worker (its internal import
// inlined) next to map.tsx (for Storybook/dev, via postinstall) and next to
// the built dist/ entry points (via postbuild), so
// `new URL("./maplibre-gl-worker.mjs", import.meta.url)` resolves correctly
// in both contexts. Bundling it into one file — rather than vendoring both
// files as-is — matters because most bundlers' `new URL(relative,
// import.meta.url)` asset handling copies the referenced file verbatim
// without processing imports inside it; a single file with nothing left to
// resolve sidesteps that entirely.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workerEntry = fileURLToPath(
  import.meta.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs"),
);

const targets = process.argv.slice(2);
const defaultTarget = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/ui",
);
const resolvedTargets = (targets.length > 0 ? targets : [defaultTarget]).map(
  (t) => path.resolve(t),
);

const result = await build({
  entryPoints: [workerEntry],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
});
const [{ text: bundledWorker }] = result.outputFiles;

for (const targetDir of resolvedTargets) {
  if (!fs.existsSync(targetDir)) continue; // e.g. dist/ before a build has run
  fs.writeFileSync(
    path.join(targetDir, "maplibre-gl-worker.mjs"),
    bundledWorker,
  );
  console.log(`Wrote bundled maplibre-gl-worker.mjs to ${targetDir}`);
}
