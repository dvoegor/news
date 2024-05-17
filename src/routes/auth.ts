import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { User } from '../database/models/User'

const router = express.Router()

/**
 * Авторизирует пользователя
 * @param {string} username — имя пользователя
 * @param {string} password — пароль пользователя
 * @returns {string} токен JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'username or password is missing' })
    }

    const user = await User.findOne({ username })
    if (!user || !user.username || !user.password) {
      return res.status(401).json({ error: 'invalid username or password' })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'invalid password' })
    }

    const SECRET = process.env.SECRET
    if (!SECRET) {
      return res.status(500).json({ error: 'JWT secret is not defined' })
    }

    const token = jwt.sign({ userId: user._id }, SECRET, {
      expiresIn: '24h',
    })

    return res.json({ token })
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

/**
 * Регистрирует пользователя
 * @param {string} username — имя пользователя
 * @param {string} password — пароль пользователя
 * @returns {string} сообщение о созданном пользователе
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'username or password is missing' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hashedPassword })
    await user.save()

    return res.status(201).json({ message: `${username} acc is created` })
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

export default router
