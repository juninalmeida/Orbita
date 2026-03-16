import 'dotenv/config'
import { app } from './app'
import { env } from '@/env'

app.listen(env.PORT, () => {
  console.log(`Orbita API rodando na porta ${env.PORT}`)
})
