/**
 * Decap CMS GitHub OAuth — /api/auth
 */
import { randomUUID } from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URL;
  if (!clientId || !redirectUri) {
    res.status(500).send('Missing GITHUB_CLIENT_ID or REDIRECT_URL');
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: randomUUID(),
  });
  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
}
