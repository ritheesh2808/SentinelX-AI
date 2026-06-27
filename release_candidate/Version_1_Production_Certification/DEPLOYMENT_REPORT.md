# DEPLOYMENT REPORT — SentinelX AI Version 1.0.0 Stable Certification

This document details the configuration for staging and production deployments.

## Staging & Production Setup

1. **Prisma Schema Migrations:**
   - Command: `npm run migrate:prod` to deploy db structure.
2. **Environment Isolation:**
   - Backend requires `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.
   - Frontend requires `VITE_API_BASE_URL` matching the backend origin.
3. **CORS Whitelisting:**
   - Explicitly limits requests to client domains mapped in backend environment.
