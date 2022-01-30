const express = require('express');
const checkAdmin = require('../middleware/checkAdmin');
const checkId = require('../middleware/checkId');
const validateBody = require('../middleware/validateBody');
const { Category, categoryJoi } = require('../models/Category');
const router = express.Router();

router.get(
  '/',
  async (req, res) => {
    try {
      const categories = await Category.find({});
      res.send(categories);
    } catch (error) {
      res.sendStatus(500).send(error.message);
    }
  }
);

router.post(
  '/',
  checkAdmin,
  validateBody(categoryJoi),
  async (req, res) => {
    try {
      const { name } = req.body;
      const category = new Category({ name });
      await category.save();
      res.send(category);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.put(
  '/:id',
  checkAdmin,
  checkId,
  validateBody(categoryJoi),
  async (req, res) => {
    try {
      const { name } = req.body;      
      const category = await Category.findByIdAndUpdate(req.params.id, { $set: { name } }, { new: true });
      if (!category) return res.status(404).send('Category not found');
      res.send(category);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.delete(
  '/:id',
  checkAdmin,
  checkId,
  async (req, res) => {
    try {
      const category = await Category.findByIdAndRemove(req.params.id);
      if (!category) res.status(404).send('Category not found');
      res.send('Category removed');
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = router;