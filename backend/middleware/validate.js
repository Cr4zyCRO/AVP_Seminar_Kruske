import Joi from "joi";

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

export const body = validate("body");
export const params = validate("params");
export const query = validate("query");
