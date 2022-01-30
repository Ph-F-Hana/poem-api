const express = require('express');
const checkAdmin = require('../middleware/checkAdmin');
const checkId = require('../middleware/checkId');
const checkToken = require('../middleware/checkToken');
const validateBody = require('../middleware/validateBody');
const validateId = require('../middleware/validateId');
const { Poet } = require('../models/Poet');
const { Comment, createCommentJoi , updateCommentJoi} = require('../models/Comment');
const { Poem, createPoemJoi, updatePoemJoi, createRatingJoi } = require('../models/Poem');
const { Category } = require('../models/Category');
const { User } = require('../models/User');
const router = express.Router();

/*Poems*/
router.get(
  '/',
  async (req, res) => {
    try {
      const poems = await Poem.find({})
      .populate("poets")
      .populate("category")
      .populate({ path: "comments", populate: { path: "owner", select: "-password -email -likes -role" } });
      res.send(poems);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  '/:id',
  checkId,
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.id)
        .populate("poets")
        .populate("category")
        .populate({ path: "comments", populate: { path: "owner", select: "-password -email -likes -role" } });
      if (!poem) return res.status(404).send("Poem not found");
      res.send(poem);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post(
  '/',
  checkAdmin,
  validateBody(createPoemJoi),
  async (req, res) => {
    try {
      const { title, description, poster, poets, category } = req.body;
      const poetsSet = new Set(poets);
      if (poetsSet.size < poets.length) return res.status(400).send("There is a duplicated poet");
      const poetsFound = await Poet.find({ _id: { $in: poets } });
      if (poetsFound.length < poets.length) return res.status(404).send("Some of the poets if not found");
      const categorySet = new Set(category);
      if (categorySet.length < category.length) return res.status(400).send("There is duplicated category");
      const categoryFound = await Category.find({ _id: { $in: category } });
      if (categoryFound.length < category.length) return res.status(404).send("Some of the categories is not found");
      const poem = new Poem({
        title,
        description,
        poster,
        poets,
        category
      });
      await poem.save();
      res.send(poem);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.put(
  '/:id',
  checkAdmin,
  validateBody(updatePoemJoi),
  async (req, res) => {
    try {
      const { title, description, poster, poets, category } = req.body;
      if (poets) {
        const poetsSet = new Set(poets);
        if (poetsSet.length < poets.length) return res.status(400).send("There is a duplicated poet");
        const poetFound = await Poet.find({ _id: { $in: poets } });
        if (poetFound.length < poets.length) return res.status(404).send("Some of the poets is not found");
      }
      if (category) {
        const categorySet = new Set(category);
        if (categorySet.length < category.length) return res.status(400).send("There is a duplicated category");
        const categoryFound = await Category.find({ _id: { $in: category } });
        if (categoryFound.length < category.length) return res.status(400).send("Some of hte category is not found");
      }

      const poem = await Poem.findByIdAndUpdate(
        req.params.id,
        { $set: { title, description, poster, poets, category } },
        { new: true }
      );
      if (!poem) return res.status(404).send("Poem is not found");
      res.send(poem);
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
      await Comment.deleteMany({ poemId: req.params.id });
      const poem = await Poem.findByIdAndRemove(req.params.id);
      if (!poem) return res.status(404).send('Poem is not found');
      res.send("Poem is removed");
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

/*Comment*/

router.get(
  '/:poemId/comments',
  validateId('poemId'),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).send("Poem is not found");
      const comments = await Comment.find({ poemId: req.params.poemId });
      res.send(comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).send(error.message);
    }
  }
);

router.post(
  '/:poemId/comments',
  checkToken,
  validateId('poemId'),
  validateBody(createCommentJoi),
  async (req, res) => {
    try {
      const { comment } = req.body;
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).send("Poem is not found");
      const newComment = new Comment({ comment, owner: req.userId, poemId: req.params.poemId });
      await Poem.findByIdAndUpdate(req.params.poemId, { $push: { comments: newComment._id } });
      await newComment.save();
      return res.send(newComment);
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

router.put(
  '/:poemId/comments/:commentId',
  checkToken,
  validateId('poemId', 'commentId'),
  validateBody(updateCommentJoi),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).send('Peom is not found');
      const { comment } = req.body;
      const commentFound = await Comment.findById(req.params.commentId);
      if (!commentFound) return res.status(404).send("Comment is not found");
      if (commentFound.owner != req.userId) return res.status(403).send("Unauthorized user");
      const updateComment = await Comment.findByIdAndUpdate(req.params.commentId, { $set: { comment } }, { new: true });
      res.send(updateComment);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.delete(
  '/:poemId/comments/:commentId',
  checkToken,
  validateId("poemId", "commentId"),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).sned("Poem is not found");
      const commentFound = await Comment.findById(req.params.commentId);
      if (!commentFound) return res.status(404).send('Comment is not found');
      const user = await User.findById(req.userId);
      if (user.role !== "Admin" && commentFound.owner != req.userId) return res.status(403).send("Unauthorized user");
      await Poem.findByIdAndUpdate(req.params.poemId, { $pull: { comments: commentFound._id } });
      await Comment.findByIdAndRemove(req.params.commentId);
      res.send("Comment is removed");
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

/*Rating*/
router.post(
  '/:poemId/ratings',
  checkToken,
  validateId('poemId'),
  validateBody(createRatingJoi),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).send("Poem is not found");
      const { rating } = req.body;
      const newRating = {
        rating,
        userId: req.userId
      };
      const ratingFound = poem.ratings.find(ratingObject => ratingObject.userId == req.userId);
      if (ratingFound) return res.status(404).send("User already reated this poem");
      const updatedPoem = await Poem.findByIdAndUpdate(req.params.poemId, { $push: { ratings: newRating } }, { new: true });
      let ratingSum = 0;
      updatedPoem.ratings.forEach(ratingOjbect => {
        ratingSum += ratingOjbect.rating;
      });
      const ratingAverage = ratingSum / updatedPoem.ratings.length;
      await Poem.findByIdAndUpdate(req.params.poemId, { $set: { ratingAverage } });
      res.send('rating added');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

/*Likes*/
router.put(
  '/:poemId/like',
  checkToken,
  // validateId('poemId'),
  async (req, res) => {
    try {
      const poem = await Poem.findById(req.params.poemId);
      if (!poem) return res.status(404).send("Poem is not found");
      const userFound = poem.like.find(like => like == req.userId);
      if (userFound) {
        await Poem.findByIdAndUpdate(req.params.poemId, { $pull: { like: req.userId } });
        await User.findByIdAndUpdate(req.userId, { $pull: { likes: poem._id } });
        res.send("Removed like from poem");
      } else {
        await Poem.findByIdAndUpdate(req.params.poemId, { $push: { like: req.userId } });
        await User.findByIdAndUpdate(req.userId, { $push: { likes: poem._id } });
        res.send("Liked poem");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);


module.exports = router;