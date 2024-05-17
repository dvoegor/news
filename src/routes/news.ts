import express, { Request, Response } from 'express'
import { AuthorizedRequest } from '../types/AuthorizedRequest'
import { authMiddleware } from '../middlewares/authentication'
import { News } from '../database/models/News'
import cron from 'node-cron'

cron.schedule('*/10 * * * * *', async () => {
  try {
    const newsToPublish = await News.find({
      date: { $lte: new Date() },
      published: false,
    })

    for (const news of newsToPublish) {
      news.published = true
      await news.save()
      console.log(`"${news.title}" is published`)
    }
  } catch (err) {
    console.error('publishing cronjob failed:', (err as Error).message)
  }
})

const router = express.Router()

router.use('/', authMiddleware)

/**
 * Создает новость
 * @param {string} title — заголовок новости
 * @param {string} content — контент новости
 * @param {Date} date — время публикации новости
 * @param {Boolean} published — публиковать ли новость
 * @returns {Object} сущность новости
 */
router.post('/', async (req: Request, res: Response) => {
  const authreq = req as AuthorizedRequest

  try {
    const { title, content, date, published } = req.body

    if (!title || !content || published === undefined) {
      return res
        .status(400)
        .json({ error: 'title, content or published is missing' })
    }

    const publishDate = date ? date : new Date()

    const news = new News({
      title,
      content,
      date: publishDate,
      published,
      author: authreq.userId,
    })
    await news.save()

    return res.status(201).json(news)
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

/**
 * Обновляет сущность новости
 * @param {string} id — айди новости
 * @param {string} title — заголовок новости
 * @param {string} content — контент новости
 * @param {Date} date — время публикации новости
 * @param {Boolean} published — публиковать ли новость
 * @returns {Object} сущность новости
 */
router.put('/:id', async (req: Request, res: Response) => {
  const authreq = req as AuthorizedRequest

  try {
    const { id } = req.params
    const { title, content, date, published } = req.body

    const existingNews = await News.findById(id)
    if (!existingNews) {
      return res.status(404).json({ error: 'no news with such id' })
    }

    if (existingNews.author !== authreq.userId) {
      return res.status(403).json({ error: 'you are not the author' })
    }

    const news = await News.findByIdAndUpdate(
      id,
      { title, content, date, published },
      { new: true }
    )

    res.json(news)
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

/**
 * Удаляет новость
 * @param {string} id — айди новости
 * @returns {Object} сущность новости
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const authreq = req as AuthorizedRequest

  try {
    const { id } = req.params

    const existingNews = await News.findById(id)
    if (!existingNews) {
      return res.status(404).json({ error: 'no news with such id' })
    }

    if (existingNews.author !== authreq.userId) {
      return res.status(403).json({ error: 'you are not the author' })
    }

    const news = await News.findByIdAndDelete(id)

    res.json(news)
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

/**
 * Публикует новость
 * @param {string} id — айди новости
 * @returns {Object} сущность новости
 */
router.put('/publish/:id', async (req: Request, res: Response) => {
  const authreq = req as AuthorizedRequest

  try {
    const { id } = req.params

    const existingNews = await News.findById(id)
    if (!existingNews) {
      return res.status(404).json({ error: 'no news with such id' })
    }

    if (existingNews.author !== authreq.userId) {
      return res.status(403).json({ error: 'you are not the author' })
    }

    const news = await News.findByIdAndUpdate(
      id,
      { published: true },
      { new: true }
    )

    res.json(news)
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
})

export default router
