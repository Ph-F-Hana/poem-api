const express = require('express');
const checkAdmin = require('../middleware/checkAdmin');
const checkId = require('../middleware/checkId');
const validateBody = require('../middleware/validateBody');
const { Poet, createPoetJoi, updatePoetJoi } = require('../models/Poet');
const router = express.Router();

router.get(
  '/',
  async (req, res) => {
    try {
      const poets = await Poet.find();
      res.send(poets);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post(
  '/',
  checkAdmin,
  validateBody(createPoetJoi),
  async (req, res) => {
    try {
      const { firstName, lastName, photo, poems, description } = req.body;
      const poet = new Poet({
        firstName,
        lastName,
        photo,
        poems,
        description
      });
      await poet.save();
      res.send(poet);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.put(
  '/:id',
  checkAdmin,
  checkId,
  validateBody(updatePoetJoi),
  async (req, res) => {
    try {
      const { firstName, lastName, photo, poems, description } = req.body;
      const poet = await Poet.findByIdAndUpdate(
        req.params.id,
        { $set: { firstName, lastName, photo, poems, description } },
        { new: true }
      );

      if (!poet) return res.status(404).send("Poet is not found");
      res.send(poet);
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
      const poet = await Poet.findByIdAndRemove(req.params.id);
      if (!poet) return res.status(404).send('Poet is not found');
      res.send("Poet is removed");
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = router;
