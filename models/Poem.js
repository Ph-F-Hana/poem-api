const mongoose = require('mongoose');
const Joi = require('joi');


const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rating: Number,
});

const poemSchema = new mongoose.Schema({
  title: String,
  description: String,
  poster: String,
  ratings: [ratingSchema],
  ratingAverage: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  poets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poet"
    }
  ],
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  ]
});

const createPoemJoi = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(5).max(50000).required(),
  poster: Joi.string().min(5).max(10000).required(),
  poets: Joi.array().items(Joi.objectid()).min(1).required(),
  category: Joi.array().items(Joi.objectid()).min(1).required(),
});

const updatePoemJoi = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(5).max(50000).required(),
  poster: Joi.string().min(5).max(10000).required(),
  poets: Joi.array().items(Joi.objectid()).min(1).required(),
  category: Joi.array().items(Joi.objectid()).min(1).required(),
});

const createRatingJoi = Joi.object({
  rating: Joi.number().min(0).max(5).required()
});

const Poem = mongoose.model("Poem", poemSchema);

module.exports = { Poem, createPoemJoi, updatePoemJoi, createRatingJoi };