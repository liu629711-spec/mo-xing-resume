/**
 * Decap CMS GitHub OAuth — /api/callback
 * GitHub 回调：用 code 换 token，postMessage 回 CMS
 */
export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'decap-cms-oauth-proxy',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URL,
    }),
  });
  const tokenData = await tokenResp.json();

  if (tokenData.error || !tokenData.access_token) {
    res.status(400).send(`OAuth error: ${tokenData.error_description || tokenData.error}`);
    return;
  }

  const token = tokenData.access_token;
  const msg = `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>授权完成</title></head>
<body><p>授权成功，正在返回后台…</p>
<script>
(function () {
  window.opener.postMessage(${JSON.stringify(msg)}, '*');
  setTimeout(function () { window.close(); }, 100);
})();
</script></body></html>`);
}
