import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './auth/routes/auth.routes'
import assetRoutes from './assets/routes/asset.routes'
import scanRoutes from './scans/routes/scan.routes'
import portRoutes from './ports/routes/port.routes'
import vulnerabilityRoutes from './vulnerabilities/routes/vulnerability.routes'
import aiRoutes from './ai/routes/ai.routes'

dotenv.config()

const app = express()

// --- Security Middleware ---
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Handled by Vercel for frontend
}))

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sentinelx-ai-8rnk.onrender.com',
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

// --- Global Rate Limiter: 150 req/15min per IP ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

// --- Auth Rate Limiter: 100 req/15min per IP (brute-force protection) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait before trying again.' },
})

app.use(globalLimiter)

// --- Health Check (required by Render) ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SentinelX AI Backend',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// --- Root ---
app.get('/', (_req, res) => {
  res.json({
    name: 'SentinelX AI',
    status: 'running',
    version: '1.0.0',
  })
})

// --- Application Routes ---
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/assets', assetRoutes)
app.use('/api/v1/scans', scanRoutes)
app.use('/api/v1/ports', portRoutes)
app.use('/api/v1/vulnerabilities', vulnerabilityRoutes)
app.use('/api/v1/ai', aiRoutes)

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// --- Global Error Handler ---
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production'
  console.error('[ERROR]', err.message)
  res.status(500).json({
    error: isDev ? err.message : 'Internal server error',
  })
})

export default app
