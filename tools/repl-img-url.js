const fs = require("fs")
const path = require("path")
const readline = require("readline")
const OSS = require("ali-oss")

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
 * @returns {Promise<Buffer>}
 */
const download = (url) => {
  console.log("download", url)
  return Promise.resolve(null)
}

/**
 * @param {Buffer} buffer
 * @param {string} resName
 * @returns {string}
 */
const uploadToOSS = async (buffer, resName) => {
  // http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190419/184758_15199.png
  const name = path.basename(nameOfPost, path.extname(nameOfPost))
  const filename = `${name}/${resName}`
  return filename
}

/**
 * @param {string} url
 * @returns {void}
 */
const enqueue = (url) => {
  if (url === null) return
  URLs.push(url)
  if (running) {
    return
  }
  // restart Or start
  running = true
  circle()
}

const circle = async () => {
  const url = URLs.shift()
  const resName = path.basename(url)
  const buf = await download(url)
  const ossUrl = await uploadToOSS(buf, resName)
  console.log("ossUrl", ossUrl)
  REPLACE_MAP[url] = ossUrl
  if (URLs.length === 0) {
    running = false
    console.log(REPLACE_MAP)
    return
  }
  circle()
}

let running = false
let nameOfPost = ""
const URLs = []
const REPLACE_MAP = {}
const POSTS_DIR = path.resolve( __dirname, "../_posts")

const ossClient = new OSS({
  region: 'oss-cn-qingdao',
  bucket: 'zxh1989',
  accessKeyId: 'LTAI4FhkwzhBwynH5Ht8MfZ4',
  accessKeySecret: 'RxTvVRMJfGfsEO8EiY3zSWT3Oek4tK',
  endpoint: 'oss-cn-qingdao.aliyuncs.com',
})

const main = (...args) => {
  const [postname] = args
  if (!postname) {
    console.log("Please provide post name.")
    return
  }
  console.log("post:", postname)
  nameOfPost = postname
  const absPath = path.join(POSTS_DIR, postname)
  const rl = readline.createInterface({
    input: fs.createReadStream(absPath),
    output: null
  })

  rl.on("line", (line) => {
    const url = xImgURLOfLine(line)
    enqueue(url)
  })
}

main("2021-04-18-webassembly-why-so-fast.md")
