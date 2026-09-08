#!/usr/bin/env node
// tsdown's own CSS handling (@tsdown/css, Lightning CSS-based) only resolves
// `@import` statements — it doesn't run Tailwind's content scanner, so it
// can't generate the utility classes components actually use. We compile
// src/styles.css with the real Tailwind CLI instead; its automatic source
// detection picks up class names from src/components/**/*.tsx on its own,
// no explicit @source needed.
//
// Runs as "prebuild" (before tsdown) rather than "postbuild" so the file
// exists in time for tsdown's own publint exports check. See
// inject-css-import.mjs for the other half — wiring the compiled file into
// the built JS entry points.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");

fs.mkdirSync(distDir, { recursive: true });

execFileSync(
  path.join(root, "node_modules/.bin/tailwindcss"),
  [
    "-i",
    path.join(root, "src/styles.css"),
    "-o",
    path.join(distDir, "style.css"),
    "--minify",
  ],
  { stdio: "inherit" },
);
