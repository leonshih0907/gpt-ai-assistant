import { Router } from 'express';
import engine from './design-engine.js';
import sessionManager from './design-session.js';

const router = Router();

router.get('/api/design/health', (req, res) => {
  res.json({ ok: true });
});

router.post('/api/design/chat', async (req, res) => {
  try {
    const { mode, message } = req.body;
    let { sessionId } = req.body;

    if (!sessionId || !sessionManager.getSession(sessionId)) {
      sessionId = sessionManager.createSession();
    }

    const result = await engine.chat(sessionId, mode, message);
    res.json({ sessionId, ...result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/design/session/:sessionId', (req, res) => {
  sessionManager.clearSession(req.params.sessionId);
  res.sendStatus(204);
});

export default router;
