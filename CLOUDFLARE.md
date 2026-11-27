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
```

`EXTRA_ALLOWED_ORIGINS` (optional) adds hosts to the referer check on `/api/search`. The production domains are already allowed in `src/middleware.ts`.

## Local preview

```bash
bun run cf:preview   # builds, then serves the Worker on http://localhost:8787
```

Runtime variables for the preview go in `.dev.vars`, with the same keys as the secrets above.

## The `/api/results` client check

Like the Vercel firewall rule, it lives in the dashboard (**Security → WAF → Custom rules**), not in this repo. Custom rules run before the Worker on the custom domains, not on `workers.dev`.

## Domains

`wrangler.jsonc` attaches `www.localscore.ai` and `localscore.ai` to the Worker as custom domains, and turns off the `*.workers.dev` and preview URLs: the WAF rule guarding `/api/results` only covers the zone's own hostnames.

Cloudflare won't take over a hostname that has DNS records you created yourself. To move a domain here, delete its A/AAAA/CNAME records first, then run `bunx wrangler triggers deploy`.

The zone also has:

- a Redirect Rule from `localscore.ai/*` to `https://www.localscore.ai/${1}` (308),
- Always Use HTTPS on,
- Bot Fight Mode off. It could challenge the CLI, and Bot Fight Mode can't be skipped per path.
