const http = require("http");
const path = require("path");
const fs = require("fs");

const req = http.get(
  {
    host: "cn.bing.com",
    pathname: "/",
    method: "GET"
  },
  res => {
    res.setEncoding("utf-8");
    res.on("data", chunk => {
      const body = chunk.toString();
      // /th?id=OHR.SquirrelHeather_ZH-CN1683129884_1920x1080.jpg
      const adjson = require("../assets/ad.json");
      const matches = /\/th\?id\=OHR\.(\w+)_[\w_\-]+\.jpg/i.exec(body);
      if (matches) {
        const src = `https://cn.bing.com${matches[0]}`;
        const title = matches[1].replace(/([a-z])([A-Z])/g, '$1 $2');
        // console.log(matches);
        adjson.unshift({ title, src });
          fs.writeFile(
          path.resolve(__dirname, "../assets/ad.json"),
          JSON.stringify(adjson, 2),
          err => {
            if (err) throw err;
            console.log("done");
          }
        );
      }
      req.abort();
    });
    res.on("close", () => {
      console.log("close");
    });
    res.on("end", () => {
      console.log("end");
    });
  }
);
