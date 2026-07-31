import { createApp } from './app';

const PORT = parseInt(process.env['SSR_PORT'] || '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`\n chess-viewer  http://localhost:${PORT}\n`);
});
