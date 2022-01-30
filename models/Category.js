const mongoose = require('mongoose');
const Joi = require('joi');

const categorySchema = new mongoose.Schema({
  name: String
});

const categoryJoi = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

const Category = mongoose.model('Category', categorySchema);

module.exports = { Category, categoryJoi };