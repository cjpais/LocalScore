# Deploying to Cloudflare Workers

The site runs on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare). The Vercel deployment keeps working as before: Vercel ignores everything listed here.

| File                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `wrangler.jsonc`      | Worker config: static assets, the R2 bucket for ISR, the self-binding  |
| `open-next.config.ts` | OpenNext config: R2 incremental cache and in-worker revalidation queue |

The database stays on Turso. The Worker reaches it over HTTP with `@libsql/client/web`.

## One-time setup

```bash
bunx wrangler login
bunx wrangler r2 bucket create localscore-opennext-cache
```

Builds need the production database, because `/` is prerendered at build time and refreshed every 60s afterwards. Put the credentials in `.env.production.local`, which is gitignored:

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Deploy, then set the runtime secrets. Each `secret put` rolls out a new version.

```bash
bun run cf:deploy
bunx wrangler secret put TURSO_DATABASE_URL
bunx wrangler secret put TURSO_AUTH_TOKEN
bunx wrangler secret put EXTRA_ALLOWED_ORIGINS  # https://localscore.<account>.workers.dev
```

`EXTRA_ALLOWED_ORIGINS` adds hosts to the referer check on `/api/search`, so search works on the `workers.dev` preview. The production domains are already allowed in `src/middleware.ts`.

## Local preview

```bash
bun run cf:preview   # builds, then serves the Worker on http://localhost:8787
```

Runtime variables for the preview go in `.dev.vars`, with the same keys as the secrets above.

## The `/api/results` client check

Like the Vercel firewall rule, it lives in the dashboard (**Security → WAF → Custom rules**), not in this repo. Custom rules run before the Worker on the custom domains, not on `workers.dev`.

## Moving the domain

`localscore.ai` DNS is already on Cloudflare. Today it points at Vercel as DNS-only records.

1. In **DNS**, delete the `www` CNAME (`cname.vercel-dns.com`) and the apex A records (`76.76.21.x`).
2. In **Workers & Pages → localscore → Settings → Domains & Routes**, add custom domains `www.localscore.ai` and `localscore.ai`.
3. Vercel redirects the apex to `www`. Add a Redirect Rule for `localscore.ai/*` → `https://www.localscore.ai/${1}` (308).
4. Make sure **Security → Bots → Bot Fight Mode** is off. It would challenge the CLI.
5. Leave the Vercel project in place until the Worker has been checked. Rolling back means restoring the two DNS records.
