const Joi = require("joi");

const validate = (section) => (objSchema) => {
  const validationSchema = Joi.object(objSchema);

  return async (req, res, next) => {
    try {
      await validationSchema.validateAsync(req[section]);
      next(); 
    } catch (err) {

      res.status(400).json({
        error: "Validation error",
        details: err.details.map((detail) => detail.message), 
      });
    }
  };
};

module.exports = {
  body: validate("body"),
  params: validate("params"), 
  query: validate("query"),
};