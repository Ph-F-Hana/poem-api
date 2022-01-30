const CustomError = require('../utils/customError');

const validateBody = elementJoi => {
  return async (req, res, next) => {
    try {
      
      const result = elementJoi.validate(req.body);
      // if (result.error) return res.status(400).send(result.error.details[0].message);
      if (result.error) throw new CustomError(result.error.details[0].message, 400);
      next();
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
};

module.exports = validateBody;