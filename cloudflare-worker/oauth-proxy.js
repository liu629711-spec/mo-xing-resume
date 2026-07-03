/**
 * Decap CMS GitHub OAuth Proxy — Cloudflare Worker
 *
 * 部署后在 Cloudflare Worker 设置 3 个环境变量（Settings → Variables）：
 *   GITHUB_CLIENT_ID     你 GitHub OAuth App 的 Client ID
 *   GITHUB_CLIENT_SECRET 你 GitHub OAuth App 的 Client Secret
 *   REDIRECT_URL         本 Worker 的 /callback 完整地址，如 https://xxx.workers.dev/callback
 *
 * GitHub OAuth App 的 Authorization callback URL 必须设为：
 *   https://<worker域名>.workers.dev/callback
 *
 * Decap CMS config.yml 的 backend 配置：
 *   backend:
 *     name: github
 *     repo: <owner>/<repo>
 *     branch: main
 *     base_url: https://<worker域名>.workers.dev
 *     auth_endpoint: auth
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CMS 点登录后弹窗到这里，重定向到 GitHub 授权页
    if (url.pathname === '/auth') {
      return handleAuth(env);
    }

    // GitHub 授权完回调到这里，用 code 换 token，postMessage 回 CMS 主窗口
    if (url.pathname === '/callback') {
      return handleCallback(url, env);
    }

    return new Response('Decap CMS OAuth Proxy. Use /auth to login.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};

async function handleAuth(env) {
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.REDIRECT_URL,
    scope: 'repo,user',
    state,
  });
  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    302,
  );
}

async function handleCallback(url, env) {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  // 用 code + client_secret 换 access_token
  const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'decap-cms-oauth-proxy',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.REDIRECT_URL,
    }),
  });
  const tokenData = await tokenResp.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      `OAuth error: ${tokenData.error_description || tokenData.error || 'unknown'}`,
      { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const token = tokenData.access_token;

  // postMessage 回 CMS 主窗口（Decap CMS 协议格式）
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>授权完成</title></head>
<body>
<p>授权成功，正在返回后台…</p>
<script>
(function () {
  var msg = 'authorization:github:success:{"token":"' + ${JSON.stringify(token)} + '","provider":"github"}';
  window.opener.postMessage(msg, '*');
  setTimeout(function () { window.close(); }, 100);
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
