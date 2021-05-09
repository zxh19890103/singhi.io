const fs = require("fs")
const path = require("path")
const readline = require("readline")
const OSS = require("ali-oss")
const http = require("http")
const https = require("https")

const logger = fs.createWriteStream("./log.txt", { encoding: "utf-8", flags: "a+" })

/**
 * {% include img.html src="https://hacks.mozilla.org/files/2017/02/logo_party01-500x169.png" title="当代浏览器携手共进" %}
 * @param {string} line
 * @returns {string}
 */
const xImgURLOfLine = (line) => {
  if (!/^\{%\s+include\s+img\.html/.test(line)) {
    return null
  }
  const match = /src="(.+?)"/.exec(line)
  if (match === null) return null
  const [, url] = match
  return url
}

/**
 * @param {string} url
 * @returns {Promise<http.IncomingMessage>}
 */
const download = (url) => {
  let _http
  if (url.startsWith("https")) {
    _http = https
  } else {
    _http = http
  }
  return new Promise(resolve => {
    console.log("downloading...")
    _http.get(
      url,
      resolve
    )
  })
}

/**
 * @param {http.IncomingMessage} incomingMsg
 * @param {string} resName
 * @returns {Promise<string>}
 */
const uploadToOSS = async (incomingMsg, resName) => {
  // http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190419/184758_15199.png
  // http://zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-03-webassembly-intro/01-01-perf_graph05.png
  const name = path.basename(nameOfPost, path.extname(nameOfPost))
  const filename = `${name}/${resName}`
  console.log("uploading...")
  return ossClient.putStream(
    filename,
    incomingMsg
  ).then(res => {
    console.log("uploaded...")
    return filename
  })
}

const circle = async () => {

  if (URLs.length === 0) {
    console.log("no images, skip")
    next()
    return
  }

  const { url, lineno } = URLs.shift()
  const resName = path.basename(url)
  try {
    const incomingMsg = await download(url)
    const ossUrl = await uploadToOSS(incomingMsg, resName)
    REPLACE_MAP[url] = ossUrl

    console.log("replace", url, ossUrl)
    lines[lineno] = lines[lineno].replace(url, `//zxh1989.oss-cn-qingdao.aliyuncs.com/${ossUrl}`)

  } catch (ex) {
    logger.write("err:", nameOfPost, lineno, url)
  } finally {
    if (URLs.length === 0) {
      console.log("circle over")
      running = false
      const entries = Object.entries(REPLACE_MAP)
      if (entries.length === 0) {
        console.log("no third-party images")
      } else {
        fs.writeFileSync(
          POSTS_DIR + "/" + nameOfPost,
          lines.join("\n")
        )
        console.log("modified")
      }

      next()
      return
    }
    circle()
  }
}

/**
 * @param {string} url
 * @returns {boolean}
 */
const isOssAsset = (url) => {
  return url && url.indexOf(".aliyuncs.com") > -1
}

const POSTS_DIR = path.resolve( __dirname, "../_posts")
let running = false
let posts = []
let nameOfPost = ""
let absPath = ""
let lines = []
let REPLACE_MAP = {}
const URLs = []

const ossClient = new OSS({
})

/**
 *
 * @param {string} postname with .md
 * @returns
 */
const handle = async (postname) => {

  console.log("post:", postname)

  nameOfPost = postname
  absPath = path.join(POSTS_DIR, postname)
  REPLACE_MAP = {}

  const rl = readline.createInterface({
    input: fs.createReadStream(absPath),
    output: null
  })

  let lineno = 0
  lines = []
  for await (const line of rl) {
    const url = xImgURLOfLine(line)
    if (url !== null && !isOssAsset(url)) {
      URLs.push({ url, lineno })
    }
    lines.push(line)
    lineno += 1
  }

  // restart Or start
  running = true
  circle()
}

const next = () => {
  const post = posts.shift()
  if (post === undefined) {
    console.log("no post left.")
    return
  }
  handle(post)
}

const main = (...args) => {
  // posts = fs.readdirSync("../_posts")
  posts = ["2018-07-08-begin-healthy-body.md"]
  next()
}

main()
