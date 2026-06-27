import app from './app'
import { bootstrapAdmin } from './config/bootstrap'

const PORT = Number(process.env.PORT ?? 5000)
const HOST = '0.0.0.0' // Required for Render — must bind to all interfaces

// Bootstrap initial database states (Admin creation)
bootstrapAdmin();

app.listen(PORT, HOST, () => {
  const env = process.env.NODE_ENV ?? 'development'
  if (env === 'development') {
    console.log(`[SentinelX] Server running at http://localhost:${PORT}`)
  } else {
    console.log(`[SentinelX] Server started on port ${PORT} (${env})`)
  }
})
