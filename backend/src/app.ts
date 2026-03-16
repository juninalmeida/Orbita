import express from 'express'
import cookieParser from 'cookie-parser'
import { routes } from '@/routes'
import { errorHandler } from '@/middlewares/error-handling'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(routes)
app.use(errorHandler)

export { app }
