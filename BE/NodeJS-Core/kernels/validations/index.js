const Joi = require('joi');
const responseUtils = require('utils/responseUtils');
const stringUtils = require('utils/stringUtils');

Joi.defaults((schema) =>
  schema.prefs({ convert: true, abortEarly: false})
);

const validate = (schemas = []) => {
  return (req, res, next) => {
    const errors = {};

    for (const schema of schemas) {
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body);
        if (error) errors.body = (errors.body || []).concat(error.details.map(d => d.message));
        else req.body = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query);
        if (error) errors.query = (errors.query || []).concat(error.details.map(d => d.message));
        else req.query = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params);
        if (error) errors.params = (errors.params || []).concat(error.details.map(d => d.message));
        else req.params = value;
      }
    }

    if (Object.keys(errors).length > 0) {
      return responseUtils.invalidated(res, errors);
    }

    next();
  };
};

/*
const validators = {
  required: (field) => Joi.required().messages({
    "any.required": `${stringUtils.capitalize(field)} is required`,
    "string.empty": `${stringUtils.capitalize(field)} cannot be empty`,
  }),

  email: (field) => Joi.string().email().messages({
    "string.email": `${stringUtils.capitalize(field)} is not in correct format`,
  }),

  isLength(options = {}) {
    let schema = Joi.string();

    if (options.min) {
      schema = schema.min(options.min).messages({
        "string.min": `${stringUtils.capitalize(field)} must be at least ${options.min} characters long`,
      });
    }

    if (options.max) {
      schema = schema.max(options.max).messages({
        "string.max": `${stringUtils.capitalize(field)} must be at most ${options.max} characters long`,
      });
    }

    this.schema = schema;
    return this;
  },

  confirmed: (field, fieldToCompare) => Joi.valid(Joi.ref(fieldToCompare)).messages({
    "any.only": `${stringUtils.capitalize(field)} and ${fieldToCompare} do not match`,
  }),

  unique(sequelizeModel, field) {
    this.schema = this.schema.external(async (value) => {
      const recordExist = await sequelizeModel.findOne({
        where: { [field]: value },
      });

      if (recordExist) {
        throw new Error(`${stringUtils.capitalize(field)} must be unique`);
      }

      return value;
    });
    return this;
  },


  custom: (validator) => Joi.custom((value, helpers) => {
    try {
      const result = validator(value, helpers);
      return result === undefined ? value : result;
    } catch (err) {
      throw new Error(
        err.message || `${stringUtils.capitalize(this.field)} is invalid`
      );
    }
  }),

  isString: (field) => Joi.string().messages({
    "string.base": `${stringUtils.capitalize(field)} must be text`,
  }),

  isNumeric: (field) => Joi.number().messages({
    "number.base": `${stringUtils.capitalize(field)} must be a number`,
  }),

  isIn: (field, values) => Joi.valid(...values).messages({
    "any.only": `${stringUtils.capitalize(field)} must be in allowable range`,
  }),
};
*/

module.exports = { validate, Joi };