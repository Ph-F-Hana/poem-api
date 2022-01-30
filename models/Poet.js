const mongoose = require('mongoose');
const Joi = require('joi');

const poetSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  poems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poem"
    }
  ],
  photo: String,
  description: String
});

const createPoetJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  poems: Joi.array().items(Joi.objectid()),
  photo: Joi.string().uri().min(5).max(1000),
  description: Joi.string().min(5).max(1000).required()
});

const updatePoetJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  poems: Joi.array().items(Joi.objectid()),
  photo: Joi.string().uri().min(5).max(1000),
  description: Joi.string().min(5).max(1000).required()
});

const Poet = mongoose.model('Poet', poetSchema);

module.exports = { Poet, createPoetJoi, updatePoetJoi };
