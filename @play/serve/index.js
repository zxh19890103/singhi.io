import { createServer } from "node:http"
import { TsProject } from "./compile.js"
import {
  bootsrapScssCompiler,
  onScssContentChanged,
  cssContent,
} from "./scss.js"
import { PostCss } from "./tailwind.js"

const main = () => {
  const files = new Map()

  let tailwindCSs = ""

  // init
  PostCss().then((res) => {
    tailwindCSs = res.css
  })

  const onTsFileChange = async () => {
    // if it's tsx file.!
    const result = await PostCss()
    tailwindCSs = result.css
    notifyClients()
  }

  const p1 = new TsProject("@play/engine", "../engine", files)
  p1.startWatching()
  p1.onWatchStatusChange(onTsFileChange)

  const p0 = new TsProject("@play", "../runs", files)
  p0.startWatching()
  p0.onWatchStatusChange(onTsFileChange)

  bootsrapScssCompiler()

  onScssContentChanged(() => {
    notifyClients("style")
  })

  const playFilePrefix = "/@play/build/"
  const playFilePrefixLength = playFilePrefix.length

  const allowedOrigin = "*"
  const sseClients = []

  createServer(
    (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin)

      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("Welcome to the Play Engine server!")
      } else if (req.url === "/files") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(Array.from(files.entries())))
      } else if (req.url === "/diagnostics") {
        const diagnostics = p0.getDiagnostics()
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(diagnostics))
      } else if (req.url === "/sse") {
        handleSSE(req, res)
      } else if (req.url.startsWith(playFilePrefix)) {
        if (isTsFile(req.url)) {
          handleTsFiles(req, res)
        } else if (isTailwindCss(req.url)) {
          handleTailwindcss(req, res)
        } else if (isCssFile(req.url)) {
          handleScss(req, res)
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" })
          res.end("File Not Found ")
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" })
        res.end("Not Found")
      }
    },
    (err) => {},
  ).listen(3000, () => {
    console.log("Server is running on http://0.0.0.0:3000")
  })

  function isTsFile(url) {
    return /\.(js|ts)(\?.+)?$/.test(url)
  }

  function isCssFile(url) {
    return /\/style\.(css|scss)(\?.+)?$/.test(url)
  }

  function isTailwindCss(url) {
    return /\/tailwind\.css(\?.+)?$/.test(url)
  }

  function handleSSE(req, res) {
    // --- SSE 特定響應頭 ---
    // 設置 Content-Type 為 text/event-stream
    res.setHeader("Content-Type", "text/event-stream")
    // 禁用緩存，確保數據即時傳輸
    res.setHeader("Cache-Control", "no-cache")
    // 保持連接開啟
    res.setHeader("Connection", "keep-alive")

    // 將新的客戶端響應對象添加到列表中
    sseClients.push(res)
    console.log(`新客戶端連接。當前連接數: ${sseClients.length}`)

    req.on("close", () => {
      const index = sseClients.indexOf(res)
      if (index > -1) {
        sseClients.splice(index, 1)
        console.log(`客戶端斷開連接。當前連接數: ${sseClients.length}`)
      }
    })
  }

  function handleTsFiles(req, res) {
    let key = "@play/" + req.url.slice(playFilePrefixLength) // Remove the playFilePrefix
    key = key.replace(/\?.+$/, "") // Convert .js to .ts for TypeScript files
    key = key.replace(/\.ts$/, ".js") // Remove .js extension if present
    console.log("Request for file:", key)

    if (files.has(key)) {
      res.writeHead(200, { "Content-Type": "application/javascript" })
      res.end(files.get(key))
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("File Not Found")
    }
  }

  function notifyClients(type = "reload") {
    const message = `event: ${type}\ndata: ${JSON.stringify({
      words: "hi",
    })}\n\n`
    for (const client of sseClients) {
      client.write(message)
    }
  }

  function handleScss(req, res) {
    res.writeHead(200, { "Content-Type": "text/css" })
    res.end(cssContent)
  }

  function handleTailwindcss(req, res) {
    res.writeHead(200, { "Content-Type": "text/css" })
    res.end(tailwindCSs)
  }
}

main()
