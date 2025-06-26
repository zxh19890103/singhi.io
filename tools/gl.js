const fs = require("fs")
const { fetchPage, getFormattedDatePadded } = require("./_lib")
const { join } = require("path")
const TurndownService = require("turndown")

/**
 *
 * @param {string} html
 */
function ExtractHTMLPartialAsMd(html) {
  const regex = /\n\s{4}<div\s+id\="content">[\s\S]*\n\s{4}<\/div>/g
  const match = regex.exec(html)
  if (match) {
    const [block] = match
    const turndownService = new TurndownService({
      headingStyle: "atx",
    })

    turndownService.addRule("Code", {
      filter: ["pre"],
      replacement: (content, n) => {
        if (n.firstElementChild.tagName === "CODE") {
          return "\n```cpp\n" + content.trim() + "\n```\n"
        } else {
          return content
        }
      },
    })

    turndownService.addRule("Var", {
      filter: ["var"],
      replacement: (content, n) => {
        return "`" + content + "`"
      },
    })

    turndownService.addRule("H12", {
      filter: ["h1", "h2", "h3"],
      replacement: (content, n) => {
        const suffixDigit = Array(1 + Number(n.tagName[1])).fill("#").join("")
        return `\n${suffixDigit} ` + content + "\n"
      },
    })

    turndownService.addRule("Link", {
      filter: ["a"],
      replacement: (content, n) => {
        if (n.href) {
          if (n.href.startsWith("/")) {
            return `[${n.textContent}](https://learnopengl.com${n.href})`
          } else {
            return `[${n.textContent}](${n.href})`
          }
        }
        return content
      },
    })

    turndownService.addRule("Fun", {
      filter: ["fun"],
      replacement: (content, n) => {
        return `\`${content}\``
      },
    })

    turndownService.addRule("Note", {
      filter: ["note", "warning"],
      replacement: (content, n) => {
        return `\n {% include box.html content="${content}" color="${
          n.tagName === "NOTE" ? "green" : "red"
        }" %}\n`
      },
    })

    turndownService.addRule("Table", {
      filter: ["table"],
      replacement: (content, n) => {
        return `\n ${n.outerHTML} \n`
      },
    })

    turndownService.addRule("Img", {
      filter: ["img"],
      replacement: (content, n) => {
        const src = n.src
        if (src.startsWith("/")) {
          return `![](https://learnopengl.com${src})`
        } else {
          return `![](${src})`
        }
      },
    })

    const markdownDoc = turndownService.turndown(block)
    return markdownDoc
  } else {
    throw new Error("Nothing Matched!")
  }
}
/**
 *
 * @param {string} mdtext
 * @returns {string}
 */
function Extract1stPictures(mdtext) {
  const regex = /!\[[^\]]*\]\((.*?)\)/g
  const match = regex.exec(mdtext)
  if (match) return match[1]
  else throw new Error("No 1st Pic!")
}
/**
 *
 * @param {string} mdtext
 * @param {string} picture
 */
function Generate(mdtext, picture) {
  const fileContent = `---
layout: bookdetail
chapter: 十
short: "--"
description: "--"
title: ${category} &bull; ${topic}
category: tech
src: "${url}"
date: ${getFormattedDatePadded()}
math: 1
book: opengl
image: "${picture}"
---

${mdtext}
  `

  fs.writeFileSync(mdfile, fileContent, { encoding: "utf8" })
  console.log("Saved!")
}

const category = "Lighting"
const topic = "Basic-Lighting"
const mdfile = join(__dirname, "../_opengl", `${category}-${topic}.md`)
const url = `https://learnopengl.com/${category}/${topic}`

const Go = async () => {
  // if (fs.existsSync(mdfile)) {
  //   throw new Error("File Exists!")
  // }

  console.log("Loading...", url)
  const fullHTML = await fetchPage(url)
  const content = ExtractHTMLPartialAsMd(fullHTML)
  const picture = Extract1stPictures(content)
  Generate(content, picture)
}

Go()
