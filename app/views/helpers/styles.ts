import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { PUBLIC_DIR } from "../../config";

const CSS_PATH = resolve(PUBLIC_DIR, "styles/main.css");

let cachedCss = "";
let cachedMtimeMs = -1;

export function inlineStylesheet(): string {
  try {
    const mtime = statSync(CSS_PATH).mtimeMs;
    if (mtime !== cachedMtimeMs) {
      cachedCss = readFileSync(CSS_PATH, "utf8");
      cachedMtimeMs = mtime;
    }
  } catch {
    /* stylesheet missing — fall back to whatever is cached */
  }
  return cachedCss;
}
