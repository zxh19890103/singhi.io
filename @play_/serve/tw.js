import postcss from "postcss";
import tailwindcssPlugin from "@tailwindcss/postcss";
import fs from "node:fs";

export const PostCss = () => {
  const processor = postcss([
    tailwindcssPlugin({
      base: "../",
      optimize: {
        minify: false,
      },
    }),
  ]);

  return processor.process(fs.readFileSync("./tw.css", { encoding: "utf-8" }), {
    from: undefined,
  });
};
