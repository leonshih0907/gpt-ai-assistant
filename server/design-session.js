import { randomUUID } from 'crypto';

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const sessions = new Map();

const pruneExpired = () => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
};

const createSession = () => {
  pruneExpired();
  const id = randomUUID();
  sessions.set(id, { history: [], createdAt: Date.now() });
  return id;
};

const getSession = (sessionId) => {
  pruneExpired();
  return sessions.get(sessionId) || null;
};

const appendToSession = (sessionId, role, content) => {
  const session = getSession(sessionId);
  if (!session) return;
  session.history.push({ role, content });
};

const clearSession = (sessionId) => {
  sessions.delete(sessionId);
};

const getHistory = (sessionId) => {
  const session = getSession(sessionId);
  return session ? session.history : [];
};

export default {
  createSession,
  getSession,
  appendToSession,
  clearSession,
  getHistory,
};
