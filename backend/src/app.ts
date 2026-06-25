import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/', (_req, res) => {
  res.json({
    name: 'SentinelX AI',
    status: 'running',
    version: '1.0.0',
  })
})

export default app
