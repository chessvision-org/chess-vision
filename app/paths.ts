import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const PUBLIC_DIR = resolve(__dirname, "../public");
