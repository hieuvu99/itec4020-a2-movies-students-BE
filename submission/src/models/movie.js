const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  original_id: {
    type: String,
    required: true,
    unique: true,
  },
  budget: {
    type: Number,
  },
  genres: [{
    type: String,
  }],
  homepage: {
    type: String,
  },
  imdb_id: {
    type: String,
    required: true,
    unique: true,
  },
  original_language: {
    type: String,
  },
  original_title: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
  },
  popularity: {
    type: Number,
  },
  poster_path: {
    type: String,
  },
  production_companies: [{
    type: String,
  }],
  production_countries: [{
    type: String,
  }],
  release_date: {
    type: Date,
  },
  revenue: {
    type: Number,
  },
  runtime: {
    type: Number,
  },
  spoken_languages: [{
    type: String,
  }],
  status_str: {
    type: String,
  },
  vote_average: {
    type: Number,
    required: true,
  },
  vote_count: {
    type: Number,
    required: true,
  },
  vote_score: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie
