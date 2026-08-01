import { build } from "esbuild";
import { resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const PKG = resolve(ROOT, "node_modules/@chessviewer-org/chess-viewer/dist/index.js");
const OUT = resolve(ROOT, "public/compiled/chess-viewer.js");

await build({
  entryPoints: [PKG],
  bundle: true,
  format: "iife",
  globalName: "ChessViewer",
  platform: "browser",
  target: ["es2018"],
  outfile: OUT,
  minify: false,
  sourcemap: false,
});

console.log(`chess-viewer browser bundle → public/compiled/chess-viewer.js`);
