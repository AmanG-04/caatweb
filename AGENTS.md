# Project Instructions

- This is a Next.js App Router application using React, TypeScript, Tailwind CSS, Vitest, and Cloudflare OpenNext.
- Preserve the existing CAAT PowerBot visual language: deep teal and dark navy backgrounds, cream surfaces, lime-gold accents, rounded cards, strong oversized headings, technical monospace labels, and subtle grid or energy-inspired visuals.
- Before changing UI, inspect the relevant route, shared components, `app/globals.css`, `tailwind.config.ts`, assets under `public/`, and nearby responsive behavior.
- Prefer existing shared components such as `SiteHeader`, `Footer`, `PublicPage`, `Reveal`, `LeadCta`, and components under `components/` instead of creating duplicates.
- Keep public pages consistent across `/`, `/solutions`, `/about-us`, `/testimonials`, `/contact`, and `/quote`.
- Treat `/admin` as a separate authenticated interface. Do not expose admin functionality, credentials, secrets, or private customer data in public routes.
- Preserve the existing quote calculation, validation, authentication, rate-limiting, PDF, D1, and R2 contracts unless the task explicitly requires changing them.
- Validate user input at API boundaries with the existing Zod validation patterns.
- Do not commit `.env.local`, `.dev.vars`, JWT secrets, passwords, API keys, Cloudflare credentials, or private customer data.
- Never run `npx wrangler deploy`. Do not run deployment commands unless explicitly requested and approved.
- For code changes, run the narrowest relevant tests first, then run `npm test`, `npm run typecheck`, and `npm run build` when practical.
- Do not add dependencies unless they are necessary and the user approves any action that could incur a cost.
- Keep animations performant and provide `prefers-reduced-motion` behavior for new animations.
- Verify new UI at desktop and mobile widths, including keyboard navigation, visible focus states, semantic HTML, labels, and accessible names.
- Use the existing project conventions for route structure, imports, class names, TypeScript types, and component organization.
- Keep markup readable with each JSX/HTML element on its own line.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
