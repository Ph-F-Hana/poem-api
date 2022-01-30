const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Joi = require('joi');
const JoiObjectid = require('joi-objectid');
Joi.objectid = JoiObjectid(Joi);
const cors = require('cors');
const users = require('./routes/users');
const poets = require('./routes/poets');
const poems = require('./routes/poems');
const categories = require('./routes/categories');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('connect to DB'))
  .catch(error => {
    console.log('error connecting to DB', error);
    process.exit(1);
  });

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', users);
app.use('/api/poets', poets);
app.use('/api/categories', categories);
app.use('/api/poems', poems);

app.use((err, req, res, next) => {
  console.error(err);
  err.statusCode = err.statusCode || 500;
  const handledError = err.statusCode < 500;
  res.status(err.statusCode)
    .send({
      message: handledError ? err.message : 'Something went wrong',
      errors: err.errors || {}
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));