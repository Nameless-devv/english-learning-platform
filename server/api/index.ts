import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/lambda';

let appHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let initError: Error | null = null;

const initPromise = createApp()
  .then((app) => { appHandler = app; })
  .catch((err) => { initError = err; console.error('Init error:', err); });

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await initPromise;
  if (initError) {
    (res as any).status(500).json({ error: initError.message });
    return;
  }
  appHandler!(req, res);
}
