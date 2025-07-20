import * as sass from "sass";
import { resolve, join } from "node:path";
import fs from "node:fs";
import { loadJsonWithComments } from "./utils.js";

const tsConfig = loadJsonWithComments("./tsconfig.json");
const tsOutDir = resolve(tsConfig.compilerOptions.outDir);

console.log("[SCSS build]", tsOutDir);

const result = await sass.compileAsync(resolve("./style.scss"), {
  style: "compressed", // 'expanded', 'compressed', 'nested', 'compact'
  loadPaths: [resolve("./")], // Tell Sass where to look for imported files
  sourceMap: false, // Generate source maps for easier debugging
});

fs.writeFileSync(join(tsOutDir, "style.css"), result.css, {
  encoding: "utf8",
});

console.log("Style runs built");
