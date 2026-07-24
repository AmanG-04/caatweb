# caat powerbot

Solar quotation platform for an Indian EPC company, built with Next.js 15, TypeScript, Cloudflare Pages/Workers, D1, and R2.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

For local admin login, add `ADMIN_ID` and `ADMIN_PASSWORD` to `.env.local`. The default seeded admin ID is `admin-1`. The remote D1 admin row is only available when running through Wrangler with the D1 binding. Restart the dev server after changing `.env.local`.

Run the calculation tests with `npm test`. The quote API currently uses the documented development seed in `lib/settings.ts`; production should load the same keys from D1.

## Cloudflare deployment

1. Create a D1 database named `solar-db` and an R2 bucket named `caat-powerbot-bills`.
2. Replace `database_id` in `wrangler.toml`.
3. Apply migrations with `npx wrangler d1 migrations apply solar-db --remote`.
4. Configure `JWT_SECRET` and provider secrets in Pages/Worker environment variables.
5. Build with `npm run cloudflare:build` and deploy with `npm run deploy` using the OpenNext Cloudflare adapter.

## Production checklist

- Replace the development admin screen with JWT middleware and hashed credentials.
- Create an admin password hash with `node scripts/hash-password.mjs "your-password"`, then update D1 safely in PowerShell:
  ```powershell
  $hash = node scripts/hash-password.mjs "your-password"
  $query = "UPDATE admins SET password_hash='$hash', active=1 WHERE id='admin-1';"
  npx wrangler d1 execute solar-db --remote --command $query
  ```
- To verify a D1 hash locally without sharing the password, copy the full `password_hash` value and run `node scripts/verify-password.mjs "PASTE_FULL_HASH_HERE"`. Enter the password when prompted; it should print `MATCH`.
- Emergency temporary login override: set Worker secrets `AUTH_MODE=plain`, `ADMIN_LOGIN_ID`, and `ADMIN_LOGIN_PASSWORD`. This bypasses D1 password verification without storing the password in D1. Remove all three secrets immediately after access is restored.
- Load all quote settings from D1 and snapshot them with each quote.
- Bind R2 for private bill uploads and issue signed URLs only to authorized staff when billing is enabled.
- Apply the rate-limit migration with `npx wrangler d1 migrations apply solar-db --remote` after adding new migrations.
- Apply the settings audit migration with `npx wrangler d1 migrations apply solar-db --remote` before using the settings editor in production. Only users with the `admin` role can change quote settings; every change is recorded in `settings_audit`.
- Add a real CAPTCHA, email provider, and WhatsApp provider through adapters.
- Replace placeholder company details, domain, logo, and legal terms.
- Configure a real site URL in `app/robots.ts` and `app/sitemap.ts`.

## API surface

`POST /api/lead` validates a public lead and returns a quote result. The Worker route boundaries for upload, settings, admin leads, status changes, PDF generation, and delivery adapters are intentionally modular so they can be bound to D1/R2 without changing the UI contracts.
