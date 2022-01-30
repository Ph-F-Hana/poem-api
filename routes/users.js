const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const { User, signUpJoi, loginJoi, profileJoi } = require('../models/User');
const checkToken = require('../middleware/checkToken');
const checkAdmin = require('../middleware/checkAdmin');
const validateBody = require('../middleware/validateBody');
const validateId = require('../middleware/validateId');

router.post(
  '/signup',
  validateBody(signUpJoi),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, avatar } = req.body;
      const userFound = await User.findOne({ email });
      if (userFound) return res.status(400).send("User already registered");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hash,
        avatar,
        emailVerified: false,
        role: "User"
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDRE_EMAIL,
          pass: process.env.SENDRE_PASSWORD
        }
      });
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" });

      await transporter.sendMail({
        from: `"Poem"<${process.env.SENDRE_EMAIL}>`,
        to: email,
        subject: "Email verification",
        html: `Hello, please click on this link to verify your email.<a href="http://${process.env.HOST}:3000/email_verified/${token}">Verify email</a>`
      });

      await user.save();
      res.send("User created, please check your email for verification link");
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  '/verify_email/:token',
  async (req, res, next) => {
    try {
      const token = req.params.token;
      const decrypted = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decrypted.id;
      const user = await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } });
      if (!user) return res.status(404).send("User not found");
      
      res.status(200).send(token);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post(
  '/add-admin',
  checkAdmin,
  validateBody(signUpJoi),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, avatar } = req.body;
      const userFound = await User.findOne({ email });
      if (userFound) return res.status(400).send("User already register");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = new User({
        firstName,
        lastName,
        email,
        passowrd: hash,
        avatar,
        role: "Admin",
        emailVerified: true
      });
      await user.save();
      delete user._doc.password;
      res.send(user);
    } catch (error) {
      console.log(error);
      res.status(500).send(erorr.message);
    }
  }
);

router.post(
  '/login/admin',
  validateBody(loginJoi),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send("User not found");
      if (user.role !== "Admin") return res.status(403).send("You are not admin");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).send("Password inccorect");
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" });
      res.send({ token });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post(
  '/login',
  validateBody(loginJoi),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send("User not found");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).send("Password incorrect");
      if (!user.emailVerified) return res.status(403).send("User not verified, please check your email");
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" });
      res.send(token);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  '/profile',
  checkToken,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.userId)
        .populate({ path: 'likes', populate: {path: 'poets', select: "firstName lastName"}, select: 'id poster title description poets'})
        .select("-__v -password");
      res.send(user);
    } catch (error) {
      res.status(400).send(error.message);
      console.log(error.message);
    }
  }
);

router.put(
  '/profile/:profileId',
  checkAdmin,
  // validateId('profileId'),
  validateBody(profileJoi),
  async (req, res, next) => {
    try {
      const { firstName, lastName, password, avatar, role } = req.body;
      let hash;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hash = await bcrypt.hash(password, salt);
      }

      const user = await User.findById(req.params.profileId);

      if (user.email === process.env.ADMIN_EMAIL && role === 'User')
        return res.status(400).send("Can't change super admin role");
      const updatedUser = await User.findByIdAndUpdate(
        req.params.profileId,
        { $set: { firstName, lastName, password: hash, avatar, role }},
        { new: true }
      ).select("-__v -password");
      res.send(updatedUser);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  '/users',
  checkAdmin,
  async (req, res, next) => {
    const users = await User.find().select("-__v -password");
    res.send(users);
  }
);

router.delete(
  '/profile/:profileId',
  checkAdmin,
  // validateId('profileId'),
  async (req, res, next) => {
    try {
      const admin = await User.findById(req.params.profileId);
      if (admin.email === process.env.ADMIN_EMAIL) return res.status(400).send("Can't remove super admin");
      await User.findByIdAndRemove(req.params.profileId);
      res.send('User is removed');
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

module.exports = router;