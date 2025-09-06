const http = require("http");
const https = require("https");
const fs = require("fs");
const {
  fetchPage,
  getFormattedDatePadded,
  getFormattedTime,
} = require("./_lib");
const { join, basename } = require("path");
const { URL } = require("url");
const TurndownService = require("turndown");

//#region lib

function getFirstLineAsTitle(text) {
  const match = text.match(/^#\s\s*(.*)$/m);
  return match ? match[1] : "";
}

//<!-- #post-## -->

const regex = /<article\b[^>]*>[\s\S]*?<\/article>\s*<!--\s*#post-##\s*-->/g;

/**
 *
 * @param {string} html
 */
const extractArticleXML = (html) => {
  const match = regex.exec(html);
  if (match) {
    const [block] = match;
    const turndownService = new TurndownService({
      headingStyle: "atx",
    });

    turndownService.addRule("figure", {
      filter: "figure",
      replacement: (content, node) => {
        const img = node.querySelector("img");
        const caption = node.querySelector("figcaption");
        const imgSrc = img.getAttribute("src") || img.getAttribute("data-src");
        let words = "no words.";
        if (caption) {
          words = caption.textContent.trim();
          if (words.length > 0) {
            words = words.replace(/"/g, '\\"'); // Escape quotes for Markdown
          } else {
            words = "no words after cap.";
          }
        }
        return `\n\n![](${imgSrc})\n${words}\n\n`;
      },
    });

    const markdownDoc = turndownService.turndown(block);

    fs.writeFileSync(rawMdFilePath, markdownDoc, { encoding: "utf-8" });
    console.log("Saved!");
  } else {
    console.log("Nothing Matched!");
  }
};

function downloadImage(url, savePath, total, i) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;

    lib
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to get '${url}' (${res.statusCode})`),
          );
        }

        const fileStream = fs.createWriteStream(savePath);
        res.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(resolve);
        });

        fileStream.on("error", (err) => {
          fs.unlink(savePath, () => reject(err));
        });
      })
      .on("error", reject);
  });
}

async function downloadAll(urls, folder = "./images") {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const total = urls.length;

  let i = 0;

  for (let url of urls) {
    try {
      const filename = basename(new URL(url).pathname);
      const savePath = join(folder, filename);

      if (skipIfImgExists && fs.existsSync(savePath)) {
        console.log(`[${++i} / ${total}] Already Downloaded: ${url}`);
        continue;
      }

      console.log(`[${++i} / ${total}]Downloading: ${url}`);
      await downloadImage(url, savePath, total, i);
      console.log(`Saved to: ${savePath}`);
    } catch (err) {
      console.error(`Error downloading ${url}:`, err.message);
    }
  }
}

//#endregion

const Prepare = () => {
  if (fs.existsSync(storyFolder)) {
    if (stopIfDone) {
      throw new Error("Folder Existed! Check it Please!");
    }
  } else {
    fs.mkdirSync(storyFolder);
  }
};

const LoadHTMLAndSaveArticleToMd = () => {
  const url = `https://www.historydefined.net/${story}/`;
  console.log("Loading...", url);
  const t = performance.now();
  // Example usage
  return fetchPage(url)
    .then((html) => {
      // console.log("Page HTML:\n", html)
      console.log("Loaded", `${performance.now() - t}ms`);
      extractArticleXML(html);
    })
    .catch((err) => {
      console.error("Error fetching page:", err.message);
    });
};

const ExtractAndDownloadPictures = () => {
  const mdText = fs.readFileSync(rawMdFilePath, { encoding: "utf-8" });
  const regex = /!\[[^\]]*\]\((.*?)\)/g;
  const urls = [];

  let match;
  while ((match = regex.exec(mdText))) {
    urls.push(match[1]);
  }

  console.log("There're totally", urls.length, "Pictures!");
  return downloadAll(urls, imagesSaveTo);
};

/**
 *
 * @param {boolean} english
 * @param {string} imgUrlCxt
 * @returns
 */
const _GenerateMdPostFile = (english = false, imgUrlCxt = null) => {
  const RawStr = fs.readFileSync(rawMdFilePath, { encoding: "utf-8" });

  const Title = getFirstLineAsTitle(RawStr) ?? story;

  let Body = RawStr;

  if (imgUrlCxt) {
    Body = Body.replace(
      /!\[\]\((?:https?:\/\/)[^\s)\/]+(?:\/[^\s)\/]+)*\/([^\/\s)]+\.(?:jpg|jpeg|png|webp|gif))\)/gi,
      `![](${imgUrlCxt}/$1)`,
    );
  }

  Body = Body.replace(
    /\!\[\]\((.*?)\)\s*\n\s*((?![*#>\-\s]).+)/g,
    tooManyPictures
      ? `<figure>\n  <img class="lazy" data-src="$1">\n  <figcaption>$2</figcaption>\n</figure>`
      : `<figure>\n  <img src="$1">\n  <figcaption>$2</figcaption>\n</figure>`,
  );

  const MdText = `---
layout: post
slug: ${story}
title: "${Title.replace(/"/g, '\\"')}"
src: "https://www.historydefined.net/${story}/"
category: hisd
date: ${getFormattedDatePadded()}
time: ${getFormattedTime()}
${tooManyPictures ? "lazy: 1" : ""}
${english ? "english: 1" : ""}
${!english ? `permalink: /historydefined/cn/${story}` : ""}
${imgUrlCxt ? `permalink: /historydefined/local/${story}` : ""}
${imgUrlCxt ? "local: 1" : ""}
---

${Body}
`;

  return MdText;
};

const GenerateNewPost = () => {
  const MdText = _GenerateMdPostFile(true);
  fs.writeFileSync(postSaveTo, MdText, { encoding: "utf-8" });
  console.log("Post Generated!");
};

/** Generate Chinese Version */
const GenerateTranslate = () => {
  const MdText = _GenerateMdPostFile(false);
  fs.writeFileSync(postCNSaveTo, MdText, { encoding: "utf-8" });
  console.log("CN Post Generated!");
};

// for the case of a lot of images included in the content.
const GenerateLocalDebug = () => {
  const MdText = _GenerateMdPostFile(true, `/historydefined/${story}/images`);
  fs.writeFileSync(postDebugSaveTo, MdText, { encoding: "utf-8" });
  console.log("Local Degbug Post Generated!");
};

const Go = async () => {
  Prepare();

  await LoadHTMLAndSaveArticleToMd();
  await ExtractAndDownloadPictures();

  GenerateNewPost();

  GenerateTranslate();
  GenerateLocalDebug();
};

/**
 * Story Name
 */
const story = "beautiful-claudia-cardinale-photos";

const storyFolder = join(__dirname, `../_historydefined/${story}`);
const imagesSaveTo = join(storyFolder, "./images");
const rawMdFilePath = join(storyFolder, "./raw.md");
const postSaveTo = storyFolder + ".md";
const postCNSaveTo = storyFolder + "_cn.md";
const postDebugSaveTo = storyFolder + "_local.md";

/**
 * 如果已經有了就不再繼續，您可以將其設置為 false 以繼續下載
 */
const stopIfDone = true;
/**
 * 是否跳過已經存在的圖片
 */
const skipIfImgExists = true;
/**
 * 是否圖集
 */
const tooManyPictures = true;

Go();
