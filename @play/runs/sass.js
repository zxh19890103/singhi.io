import * as sass from "sass"
import { resolve } from "node:path"
import fs from "node:fs"

const result = await sass.compileAsync(resolve("./style.scss"), {
  style: "compressed", // 'expanded', 'compressed', 'nested', 'compact'
  loadPaths: [resolve("./")], // Tell Sass where to look for imported files
  sourceMap: false, // Generate source maps for easier debugging
})

fs.writeFileSync(resolve("../build/runs-style.css"), result.css, {
  encoding: "utf8",
})

console.log("Style runs built")
