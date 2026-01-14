import Joi from "joi";

export const createCompanySchema = {
  company_oib: Joi.string().length(11).required(),
  address: Joi.string().min(3).required(),
  city: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  sector_id: Joi.string().guid({ version: "uuidv4" }).required(),
  owner_id: Joi.string().guid({ version: "uuidv4" }).required()
};

export const updateCompanySchema = {
  company_oib: Joi.string().length(11),
  email: Joi.string().email(),
  address: Joi.string(),
  city: Joi.string(),
  owner_id: Joi.string().guid({ version: "uuidv4" }).required(),
  sector_id: Joi.string().guid({ version: "uuidv4" }).required(),

};