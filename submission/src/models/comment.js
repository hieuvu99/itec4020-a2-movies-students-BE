const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Movie',
  },
  text: {
    type: String,
    trim: true,
    required: true,
  }
}, {
  timestamps: true,
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
