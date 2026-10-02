# Cloud-Photo-Vault

## Node API

The Node API uses `@supabase/server` to verify Supabase user tokens. It exposes:

- `GET /api/health` — public health check.
- `GET /api/me` — requires a valid Supabase access token in the `Authorization` header and returns the authenticated user's ID and email.

### Local setup

Requires Node.js 22.9 or later.

1. Copy `.env.example` to `.env`.
2. Set `SUPABASE_SECRET_KEY` in `.env` to the full secret key from the Supabase API Keys settings. Keep it server-side; never put it in browser code or commit `.env`.
3. Start the API with `npm start`.

The `.env.example` includes the project's URL, publishable key, and JWKS URL. The secret key was not supplied in full, so it must be entered locally. `SUPABASE_SECRET_KEY` is needed by the server package to initialize its admin client, even though the example route does not use that client.

The frontend is currently static and is not wired to this API yet.
