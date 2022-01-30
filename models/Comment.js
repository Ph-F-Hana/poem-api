const mongoose = require('mongoose');
const Joi = require('joi');

const commentSchema = new mongoose.Schema({
  comment: String,
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poem"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const createCommentJoi = Joi.object({
  comment: Joi.string().min(3).max(100).required()
});

const updateCommentJoi = Joi.object({
  comment: Joi.string().min(3).max(100).required()
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment, createCommentJoi, updateCommentJoi };