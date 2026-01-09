import Joi from 'joi';

export const createSectorSchema = {
  sector_name: Joi.string().required(),
};
