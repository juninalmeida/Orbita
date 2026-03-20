import 'dotenv/config'
import { app } from './app'
import { env } from '@/env'

const server = app.listen(env.PORT, () => {
  console.log(`Orbita API running on port ${env.PORT}`)
})

function shutdown() {
  console.log('Shutting down gracefully...')
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
