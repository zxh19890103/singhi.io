import postcss from "postcss";
import tailwindcssPlugin from "@tailwindcss/postcss";
import fs from "node:fs";
import { fileURLToPath } from "url";
import { join, resolve, dirname } from "node:path";

import { loadJsonWithComments } from "./utils.js";

const tsConfig = loadJsonWithComments("./tsconfig.json");
const tsOutDir = resolve(tsConfig.compilerOptions.outDir);

console.log("[Tw build]", tsOutDir);

const processor = postcss([
  tailwindcssPlugin({
    base: "./",
    optimize: {
      minify: true,
    },
  }),
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

processor
  .process(
    fs.readFileSync(join(__dirname, "./tw.css"), { encoding: "utf-8" }),
    {
      from: undefined,
      to: join(tsOutDir, "tw.css"),
    },
  )
  .then((res) => {
    fs.writeFileSync(join(tsOutDir, "tw.css"), res.css, { encoding: "utf-8" });
    console.log("Tw csss written in: ", join(tsOutDir, "tw.css"));
  });
