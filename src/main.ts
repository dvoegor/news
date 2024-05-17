import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import authRouter from './routes/auth'
import newsRouter from './routes/news'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/auth', authRouter)
app.use('/news', newsRouter)

app.get('/', (req, res) => {
  res.send('Hello, Front!')
})

mongoose
  .connect(process.env.MONGO as string)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => console.error((err as Error).message))
