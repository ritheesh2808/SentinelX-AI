import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './auth/routes/auth.routes'
import assetRoutes from './assets/routes/asset.routes'
import scanRoutes from './scans/routes/scan.routes'
import portRoutes from './ports/routes/port.routes'
import vulnerabilityRoutes from './vulnerabilities/routes/vulnerability.routes'
import aiRoutes from './ai/routes/ai.routes'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())

app.use('/auth', authRoutes)
app.use('/assets', assetRoutes)
app.use('/scans', scanRoutes)
app.use('/ports', portRoutes)
app.use('/vulnerabilities', vulnerabilityRoutes)
app.use('/ai', aiRoutes)

app.get('/', (_req, res) => {
  res.json({
    name: 'SentinelX AI',
    status: 'running',
    version: '1.0.0',
  })
})

export default app
