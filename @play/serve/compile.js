import ts from "typescript"
import path from "node:path"
import fs from "node:fs"

/**
 * Manages a TypeScript project, watching for file changes, compiling incrementally,
 * and storing emitted JavaScript files in memory.
 */
export class TsProject {
  /** @private {string} The root path of the TypeScript project. */
  projectPath
  /** @private {string | undefined} The resolved path to tsconfig.json. */
  tsConfigPath
  /** @private {ts.WatchCompilerHost<ts.EmitAndSemanticDiagnosticsBuilderProgram> | undefined} */
  watchCompilerHost
  /** @private {ts.WatchProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram> | undefined} */
  watchProgram
  /** @readonly {Map<string, string>} Stores emitted JavaScript file paths to their content. */
  emittedFiles = new Map()
  /** @readonly {Map<string, ts.Diagnostic[]>} Stores diagnostics, keyed by file path. */
  fileDiagnostics = new Map()
  /** @private {ts.Diagnostic[]} Stores global diagnostics (e.g., tsconfig errors). */
  globalDiagnostics = []
  /** @private {((filePath: string, content: string) => void) | undefined} Callback for when a file is emitted. */
  onEmitCallback
  /** @private {((diagnostics: ts.Diagnostic[]) => void) | undefined} Callback for when diagnostics change. */
  onDiagnosticsCallback
  /** @private {((status: ts.Diagnostic) => void) | undefined} Callback for watch status changes. */
  onWatchStatusChangeCallback

  /**
   * Creates an instance of TsProject.
   * @param {string} name The name of the project (not used internally, but can be useful for logging).
   * @param {string} projectPath The absolute path to the project folder containing tsconfig.json.
   * @param {Map<string, string>}  files absolute path to the project folder containing tsconfig.json.
   */
  constructor(name, projectPath, files) {
    this.name = name
    this.projectPath = path.resolve(projectPath) // Ensure absolute path
    this.emittedFiles = files ? files : new Map()
    this.fileDiagnostics = new Map()
    this.globalDiagnostics = []

    // Validate project path existence
    if (
      !fs.existsSync(this.projectPath) ||
      !fs.statSync(this.projectPath).isDirectory()
    ) {
      throw new Error(
        `Project path does not exist or is not a directory: ${this.projectPath}`,
      )
    }

    // Find tsconfig.json
    this.tsConfigPath = ts.findConfigFile(
      this.projectPath,
      ts.sys.fileExists,
      "tsconfig.json",
    )
    if (!this.tsConfigPath) {
      throw new Error(
        `tsconfig.json not found in project path: ${this.projectPath}`,
      )
    }

    console.log(`Initialized TsProject for: ${this.projectPath}`)
    console.log(`Using tsconfig.json at: ${this.tsConfigPath}`)
  }

  /**
   * Starts watching the project files for changes and compiles incrementally.
   */
  startWatching() {
    if (this.watchProgram) {
      console.warn(
        "Watcher is already running. Call stopWatching() first if you want to restart.",
      )
      return
    }

    // Read and parse tsconfig.json
    const configFile = ts.readConfigFile(this.tsConfigPath, ts.sys.readFile)
    if (configFile.error) {
      throw new Error(
        `Error reading tsconfig.json: ${ts.formatDiagnostic(
          configFile.error,
          ts.sys,
        )}`,
      )
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      this.projectPath, // Base path for resolving relative paths in tsconfig
      { outDir: this.projectPath },
      this.tsConfigPath,
    )

    if (parsedConfig.errors.length > 0) {
      throw new Error(
        `Errors parsing tsconfig.json content: ${ts.formatDiagnostics(
          parsedConfig.errors,
          ts.sys,
        )}`,
      )
    }

    // Ensure noEmit is false for compilation output
    const compilerOptions = {
      ...parsedConfig.options,
      noEmit: false,
    }

    // Create a custom watch compiler host
    this.watchCompilerHost = ts.createWatchCompilerHost(
      this.tsConfigPath,
      compilerOptions,
      ts.sys,
      null,
      // Report Diagnostics Callback
      (diagnostic) => {
        // Clear previous diagnostics for the affected file
        if (diagnostic.file) {
          const filePath = diagnostic.file.fileName
          let diagnosticsForFile = this.fileDiagnostics.get(filePath) || []
          // Filter out existing diagnostic with the same code and message to avoid duplicates
          // This is a simple deduplication; for robust solutions, you might clear and re-add all for a file.
          if (
            !diagnosticsForFile.some(
              (d) =>
                d.code === diagnostic.code &&
                d.messageText === diagnostic.messageText,
            )
          ) {
            diagnosticsForFile.push(diagnostic)
          }
          this.fileDiagnostics.set(filePath, diagnosticsForFile)
        } else {
          // Global diagnostics (e.g., config errors, general project issues)
          this.globalDiagnostics.push(diagnostic)
        }
        // Notify external listeners about diagnostic changes
        this.onDiagnosticsCallback?.(this.getDiagnostics())
      },
      // Report Watch Status Callback
      (status, newLine, options) => {
        // This callback provides information about the watch process itself (e.g., "Starting compilation...")
        // console.log(`[Watch Status] ${ts.formatDiagnostic(status, ts.sys)}`);
        this.onWatchStatusChangeCallback?.(status)
      },
      {},
    )

    // Override the writeFile method on the host to capture emitted files in memory
    // const originalWriteFile = this.watchCompilerHost.writeFile

    this.watchCompilerHost.writeFile = (
      fileName,
      data,
      writeByteOrderMark,
      onError,
      sourceFiles,
    ) => {
      if (fileName.endsWith(".js") && !fileName.endsWith(".d.ts")) {
        const rFilename = path.relative(this.projectPath, fileName)
        const key = this.name + "/" + rFilename
        this.emittedFiles.set(key, data)
        this.onEmitCallback?.(key, data) // Notify listeners
      }
      // If you still want to write to disk, uncomment the following line:
      // originalWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
    }

    // Create the watch program
    this.watchProgram = ts.createWatchProgram(this.watchCompilerHost)
    console.log("TypeScript project watcher started.")
  }

  /**
   * Stops watching the project files.
   */
  stopWatching() {
    if (this.watchProgram) {
      this.watchProgram.close()
      this.watchProgram = undefined
      this.watchCompilerHost = undefined
      console.log("TypeScript project watcher stopped.")
    } else {
      console.warn("Watcher is not running.")
    }
  }

  /**
   * Retrieves the compiled JavaScript code for a given TypeScript file.
   * Note: This only returns files that have been emitted by the compiler.
   * @param {string} tsFilePath The absolute path to the TypeScript file (e.g., /path/to/project/src/myFile.ts).
   * @returns {string | undefined} The compiled JavaScript code as a string, or undefined if not found.
   */
  getCompiledCode(tsFilePath) {
    // Determine the expected JS output path based on compiler options (outDir, etc.)
    // For simplicity, we'll assume a direct .js equivalent for now.
    // In a real scenario with `outDir`, you'd need to calculate the output path.
    const jsFilePath = tsFilePath.replace(/\.ts$/, ".js")
    return this.emittedFiles.get(jsFilePath)
  }

  /**
   * Returns a Map of all currently emitted JavaScript files and their content.
   * @returns {Map<string, string>} A map where keys are absolute JS file paths and values are their content.
   */
  getAllCompiledFiles() {
    return new Map(this.emittedFiles) // Return a copy to prevent external modification
  }

  /**
   * Returns all current diagnostics (errors and warnings) for the project.
   * @returns {ts.Diagnostic[]} An array of TypeScript diagnostics.
   */
  getDiagnostics() {
    const allDiagnostics = []
    this.fileDiagnostics.forEach((diags) => allDiagnostics.push(...diags))
    allDiagnostics.push(...this.globalDiagnostics)
    return allDiagnostics
  }

  /**
   * Registers a callback function to be called when a JavaScript file is emitted.
   * @param {(filePath: string, content: string) => void} callback The callback function.
   */
  onEmit(callback) {
    this.onEmitCallback = callback
  }

  /**
   * Registers a callback function to be called when diagnostics change (e.g., new errors/warnings appear).
   * @param {(diagnostics: ts.Diagnostic[]) => void} callback The callback function.
   */
  onDiagnostics(callback) {
    this.onDiagnosticsCallback = callback
  }

  /**
   * Registers a callback function to be called when the watch status changes.
   * @param {(status: ts.Diagnostic) => void} callback The callback function.
   */
  onWatchStatusChange(callback) {
    this.onWatchStatusChangeCallback = callback
  }
}

// const project = new TsProject("../runs")
// project.startWatching()
// project.onWatchStatusChange(() => {
//   console.log("Emitted files:", project.getAllCompiledFiles())
// })

// setTimeout(() => {
//   console.log("Emitted files:", project.getAllCompiledFiles())
//   console.log("Diagnostics:", project.getDiagnostics())
// }, 2000)
