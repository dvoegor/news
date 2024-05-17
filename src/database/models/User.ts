import mongoose, { Schema } from 'mongoose'

const user = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

export const User = mongoose.model('User', user)
