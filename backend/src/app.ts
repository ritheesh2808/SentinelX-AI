import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './auth/routes/auth.routes'
import assetRoutes from './assets/routes/asset.routes'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())

app.use('/auth', authRoutes)
app.use('/assets', assetRoutes)

app.get('/', (_req, res) => {
  res.json({
    name: 'SentinelX AI',
    status: 'running',
    version: '1.0.0',
  })
})

export default app
