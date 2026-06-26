import app from './app'

const PORT = Number(process.env.PORT ?? 5000)
const HOST = '0.0.0.0' // Required for Render — must bind to all interfaces

app.listen(PORT, HOST, () => {
  const env = process.env.NODE_ENV ?? 'development'
  if (env === 'development') {
    console.log(`[SentinelX] Server running at http://localhost:${PORT}`)
  } else {
    console.log(`[SentinelX] Server started on port ${PORT} (${env})`)
  }
})
