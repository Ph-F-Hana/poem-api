const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const CustomError = require('../utils/customError');

const checkAdmin = async (req, res, next) => {
  try {

    const token = req.headers["authorization"];
    // if (!token) return res.status(401).send("token is minssing");
    if (!token) throw new CustomError('token is missing', 401);
    
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decryptedToken.id;
    
    const adminFound = await User.findById(userId);
    
    // if (!adminFound) return res.status(404).send("User not found");
    if (!adminFound) throw new CustomError("User not found", 404);
    // if (adminFound.role !== "Admin") return res.statu(403).send("Yor are not admin");
    if (adminFound.role !== "Admin") throw new CustomError("Yor are not admin", 403);
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

module.exports = checkAdmin;