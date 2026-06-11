# PrepRoute Task

## API setup

Local development uses `VITE_API_URL=/api`. Vite proxies `/api/*` to:

```text
https://admin-moderator-backend-staging.up.railway.app
```

Vercel production also uses `/api/*`, with the rewrite configured in `vercel.json`.

If you prefer not to use the Vercel rewrite, set this environment variable in Vercel instead:

```env
VITE_API_URL=https://admin-moderator-backend-staging.up.railway.app
```

After changing Vercel env variables or `vercel.json`, redeploy the project.
