const mongoose = require('mongoose');
const CustomError = require('../utils/customError');

const validateId = (...idArray) => {
  return async (req, res, next) => {
    try {

      idArray.forEach(idName => {
        // if (!mongoose.Types.ObjectId.isValid(req.params[idName])) return res.status(400).send(`the path ${idName} id is not a valid object id`); 
        if (!mongoose.Types.ObjectId.isValid(req.params[idName]))
        throw new CustomError(`the path ${idName} id is not a valid object id`, 400); 
      });
      next();
    } catch (error) {
      console.log(error.message);
      res.status(500).send(error.message);
    }
  };
};

module.exports = validateId;