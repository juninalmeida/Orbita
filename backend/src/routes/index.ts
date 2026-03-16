// src/routes/index.ts
import { Router } from 'express'

const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'Orbita API Online!' })
})

export { routes }
