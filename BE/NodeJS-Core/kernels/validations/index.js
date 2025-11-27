const Joi = require('joi');
const responseUtils = require('utils/responseUtils');
const stringUtils = require('utils/stringUtils');

Joi.defaults((schema) =>
  schema.prefs({ convert: true, abortEarly: false})
);

const validate = (schemas = []) => {
  return (req, res, next) => {
    const errors = [];

    for (const schema of schemas) {
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body);
        if (error) errors.push(...error.details.map(d => d.message));
        else req.body = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query);
        if (error) errors.push(...error.details.map(d => d.message));
        else req.query = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params);
        if (error) errors.push(...error.details.map(d => d.message));
        else req.params = value;
      }
    }

    if (errors.length > 0) {
      return responseUtils.invalidated(res, errors);
    }

    next();
  };
};

module.exports = { validate, Joi };