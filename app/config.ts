import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url));

export const PUBLIC_DIR = resolve(ROOT_DIR, "public");

export const CHANGELOG_PATH = resolve(ROOT_DIR, "CHANGELOG.md");

const PORT_RAW = process.env["SSR_PORT"] ?? "3000";
const PORT = Number(PORT_RAW);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error(`Invalid SSR_PORT: "${PORT_RAW}"`);
}

export const PORT_CONFIG = PORT;
