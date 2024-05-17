import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { AuthorizedRequest } from '../types/AuthorizedRequest'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: 'JWT is missing' })
  }

  try {
    const SECRET = process.env.SECRET
    if (!SECRET) {
      return res.status(500).json({ error: 'JWT secret is not defined' })
    }

    const decoded = jwt.verify(
      token.includes('Bearer ') ? token.split('Bearer ')[1] : token,
      SECRET
    )
    const payload = decoded as { userId: string }
    ;(req as AuthorizedRequest).userId = payload.userId

    next()
  } catch (err) {
    return res.status(401).json({ error: (err as Error).message })
  }
}
