const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  password: String,
  avatar: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poem"
    }
  ],
  role: {
    type: String,
    enum: ['Admin', 'User'],
    default: 'User'
  }
});

const signUpJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  avatar: Joi.string().uri().required(),
  emailVerified: Joi.boolean(),
  role: Joi.string().valid('Admin', 'User')
});


const loginJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const profileJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  avatar: Joi.string().uri().required(),
  emailVerified: Joi.boolean(),
  role: Joi.string().valid('Admin', 'User')
});

const User = mongoose.model("User", userSchema);

module.exports = { User, signUpJoi, loginJoi, profileJoi };