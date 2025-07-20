import fs from "node:fs";

export function loadJsonWithComments(filePath) {
  try {
    let fileContent = fs.readFileSync(filePath, "utf8");

    // Remove single-line comments (// ...)
    fileContent = fileContent.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments (/* ... */)
    fileContent = fileContent.replace(/\/\*[\s\S]*?\*\//g, "");

    // Parse the cleaned content
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("Error loading JSON with comments:", error);
    return null;
  }
}
