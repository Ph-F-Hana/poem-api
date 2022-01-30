const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const CustomError = require('../utils/customError');

const checkToken = async (req, res, next) => {
  try {

    const token = req.header('Authorization');
    // if (!token) return res.status(401).send("token is required");
    if (!token) throw new CustomError("token is required", 401);
    
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decryptedToken.id;
    
    const user = await User.findById(userId);
    // if (!user) return res.status(404).send("User not found");
    if (!user) throw new CustomError("User not found", 404);
    req.userId = userId;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = checkToken;