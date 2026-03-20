import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '@/utils/AppError'

function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
    })
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'validation error',
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  return response.status(500).json({
    message: 'internal server error',
  })
}

export { errorHandler }
