import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/index.js';
import designRouter from '../server/design-router.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dir, '../public');

const app = express();

app.use(express.json());
app.use(express.static(publicDir));
app.use(designRouter);

app.get('/design', (req, res) => {
  res.sendFile(join(publicDir, 'design-chat.html'));
});

app.get('/', (req, res) => {
  res.redirect('/design');
});

if (config.APP_PORT) {
  app.listen(config.APP_PORT, () => {
    console.log(`Design server running on port ${config.APP_PORT}`);
  });
}

export default app;
