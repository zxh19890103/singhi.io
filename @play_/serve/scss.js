// compile-sass.js
import * as sass from "sass"
import chokidar from "chokidar"
import path from "node:path"
import fs from "node:fs"

const __dirname = path.resolve('./')
const SASS_SRC_DIR = path.resolve("../")
const CSS_DEST_DIR = path.resolve("../build") // Output directory for compiled CSS
const MAIN_SCSS_FILE = path.join(__dirname, "./main.scss")
const OUTPUT_CSS_FILE = path.join(CSS_DEST_DIR, "style.css")

// Ensure the output directory exists
if (!fs.existsSync(CSS_DEST_DIR)) {
  fs.mkdirSync(CSS_DEST_DIR, { recursive: true })
}

/**
 * @type {string}
 */
let cssContent = null
let scssContentChanged = () => {}

const onScssContentChanged = (fn) => {
  scssContentChanged = fn
}

/**
 * Compiles the main Sass file.
 * @param {boolean} isInitialBuild - True if this is the first build, false otherwise.
 */
async function compileSass(isInitialBuild = false) {
  console.log(
    `[Sass] ${isInitialBuild ? "Building" : "Rebuilding"} ${path.basename(
      MAIN_SCSS_FILE,
    )}...`,
  )
  try {
    const result = await sass.compileAsync(MAIN_SCSS_FILE, {
      style: "expanded", // 'expanded', 'compressed', 'nested', 'compact'
      loadPaths: [SASS_SRC_DIR], // Tell Sass where to look for imported files
      sourceMap: false, // Generate source maps for easier debugging
    })

    scssContentChanged?.()
    cssContent = result.css

    // fs.writeFileSync(OUTPUT_CSS_FILE, result.css)
    // if (result.sourceMap) {
    //   fs.writeFileSync(
    //     `${OUTPUT_CSS_FILE}.map`,
    //     JSON.stringify(result.sourceMap),
    //   )
    // }

    console.log(
      `Fake ! [Sass] Successfully compiled to ${path.relative(
        process.cwd(),
        OUTPUT_CSS_FILE,
      )}`,
    )
  } catch (error) {
    console.error("[Sass] Compilation Error:", error.message)
    // Log more details in development for better debugging
    if (error.file) console.error(`  File: ${error.file}`)
    if (error.line)
      console.error(`  Line: ${error.line}, Column: ${error.column}`)
  }
}

/**
 * Sets up a file watcher for Sass files.
 */
function watchSassFiles() {
  console.log(`[Sass Watcher] Watching changes in ${SASS_SRC_DIR}...`)
  console.log("----- ", SASS_SRC_DIR + "/**/*.scss")
  chokidar
    .watch(SASS_SRC_DIR, {
      ignored: (path, stats) => stats?.isFile() && !path.endsWith(".scss"), // only watch js files
      persistent: true,
      ignoreInitial: true, // Don't trigger 'add' events on startup
    })
    .on("change", (filePath) => {
      console.log(
        `[Sass Watcher] Change detected in: ${path.relative(
          SASS_SRC_DIR,
          filePath,
        )}`,
      )
      compileSass()
    })
    .on("add", (filePath) => {
      console.log(
        `[Sass Watcher] New file added: ${path.relative(
          SASS_SRC_DIR,
          filePath,
        )}`,
      )
      compileSass() // Recompile if a new SCSS file is added (e.g., a new partial)
    })
    .on("unlink", (filePath) => {
      console.log(
        `[Sass Watcher] File removed: ${path.relative(SASS_SRC_DIR, filePath)}`,
      )
      compileSass() // Recompile if an SCSS file is removed
    })
    .on("error", (error) => {
      console.error(`[Sass Watcher] Error: ${error}`)
    })
}

const bootsrapScssCompiler = () => {
  compileSass(true).then(() => {
    // Then start watching for changes
    watchSassFiles()
  })
}

export { bootsrapScssCompiler, cssContent, onScssContentChanged }
