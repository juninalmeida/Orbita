import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { routes } from '@/routes'
import { errorHandler } from '@/middlewares/error-handling'
import { env } from '@/env'

const app = express()

const allowedOrigins = env.WEB_URL.split(',').map((url) => url.trim())

app.use(helmet())
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)
app.use('/users/profile/avatar', express.json({ limit: '1mb' }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(routes)
app.use(errorHandler)

export { app }
