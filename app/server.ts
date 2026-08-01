import { createServer } from "node:http";

import { createApp } from "./app";
import { PORT_CONFIG } from "./config";

const LISTEN_BACKLOG = 2048;

const app = createApp();
const server = createServer(app);

server.listen(PORT_CONFIG, undefined, LISTEN_BACKLOG, () => {
  console.log(`\n chess-viewer  http://localhost:${PORT_CONFIG}\n`);
});

server.requestTimeout = 30_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
