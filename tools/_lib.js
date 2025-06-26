const http = require("http")
const https = require("https")
const { URL } = require("url")

/**
 * 
 * @param {string} url 
 * @returns 
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url)
      const lib = parsedUrl.protocol === "https:" ? https : http

      lib
        .get(parsedUrl, (res) => {
          let data = ""

          res.on("data", (chunk) => {
            data += chunk
          })

          res.on("end", () => {
            resolve(data)
          })
        })
        .on("error", (err) => {
          reject(err)
        })
    } catch (err) {
      reject(err)
    }
  })
}

function getFormattedDatePadded() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getFormattedTime() {
  const now = new Date()
  const hours = now.getHours()
  const minitues = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${hours}:${minitues}:${seconds}`
}

module.exports = {
  fetchPage,
  getFormattedDatePadded,
  getFormattedTime,
}
