#!/usr/bin/env node
// Stitches a side-effect import for the Tailwind build (see build-css.mjs)
// into the JS entry points tsdown produces, the same pattern already used
// for maplibre-gl's own stylesheet — so consumers get ewa-ui's styles for
// free just by importing the package, no separate CSS import required.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");

const mjsPath = path.join(distDir, "index.mjs");
const mjs = fs.readFileSync(mjsPath, "utf8");
if (!mjs.includes('"./style.css"')) {
  fs.writeFileSync(mjsPath, `import "./style.css";\n${mjs}`);
}

const cjsPath = path.join(distDir, "index.cjs");
const cjs = fs.readFileSync(cjsPath, "utf8");
if (!cjs.includes('"./style.css"')) {
  fs.writeFileSync(cjsPath, `require("./style.css");\n${cjs}`);
}

console.log("Wired dist/style.css into dist/index.{mjs,cjs}");
