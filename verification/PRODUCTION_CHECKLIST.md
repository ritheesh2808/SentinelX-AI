# SentinelX AI — Production Release Checklist

This checklist defines the validation tasks required before deploying SentinelX AI to production.

---

## 1. Database & Migrations
- [ ] Run Prisma database migration sync in deployment pipeline (`npx prisma migrate deploy`).
- [ ] Verify that database credentials are correct in the production environment settings.
- [ ] Confirm Neon PostgreSQL auto-scaling connection limit limits match expected user volumes.

## 2. Server Environment Setup
- [ ] Verify `NODE_ENV` is set to `production` in Render service configurations.
- [ ] Configure `FRONTEND_URL` on Render to target the production Vercel frontend URL, restricting CORS bounds.
- [ ] Set `VITE_API_BASE_URL` on Vercel to target the production Render API endpoint.
- [ ] Confirm `GEMINI_API_KEY` is loaded securely on Render environment variables.
- [ ] Change `JWT_SECRET` in production configuration settings to a cryptographically secure key (e.g. generated via `openssl rand -hex 32`).

## 3. Security & Access Control
- [ ] Disable public signup if needed, or enforce strict role approval mechanisms for new analysts.
- [ ] Verify helmet headers block frame injection.
- [ ] Ensure that SSL connectivity is active (`useSSL` flag on pg Pool resolves to true).

## 4. Operational Monitoring
- [ ] Verify `/health` route response codes under production workloads.
- [ ] Set up external log collection hooks to save server stdout logs.
- [ ] Configure alarms on Gemini API rate quota limits.
