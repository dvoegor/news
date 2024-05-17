import mongoose from 'mongoose'

const news = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
})

export const News = mongoose.model('News', news)
