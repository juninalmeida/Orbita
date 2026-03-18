import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { routes } from '@/routes'
import { errorHandler } from '@/middlewares/error-handling'
import { env } from '@/env'

const app = express()

app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
)
app.use(express.json())
app.use(cookieParser())
app.use(routes)
app.use(errorHandler)

export { app }
