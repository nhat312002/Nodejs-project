// const { ExpressValidator } = require("express-validator");
// const response = require("utils/responseUtils");

// const { validationResult } = new ExpressValidator(
//   {},
//   {},
//   {
//     errorFormatter: (error) => ({
//       field: error.path,
//       message: error.msg,
//     }),
//   }
// );

// const validate = (validationArray) => {
//   return async (req, res, next) => {
//     for (let validation of validationArray) {
//       for (let _validation of validation) {
//         await _validation.get().run(req);
//       }
//     }

//     const errors = validationResult(req);
//     if (errors.isEmpty()) {
//       return next();
//     }

//     return response.invalidated(res, {
//       errors: errors.array(),
//     });
//   };
// };

// module.exports = { validate };

const Joi = require('joi');
const response = require('utils/responseUtils');

Joi.defaults((schema) =>
  schema.prefs({ convert: true, abortEarly: false })
);

/**
 * validate(validationArray)
 * Example usage:
 *   validate([
 *     [new BodyWithLocale('email').string().email().required()],
 *     [new ParamWithLocale('id').number().required()],
 *   ])
 */
const validate = (validationArray) => {
  return async (req, res, next) => {
    try {
      // Group validators by their source automatically
      // const grouped = { body: {}, params: {}, query: {} };

      // for (const group of validationArray) {
      //   for (const validator of group) {
      //     grouped[validator.source][validator.field] = validator.get();
      //   }
      // }
      const grouped = { body: {}, params: {}, query: {} };

      for (const group of validationArray) {
        for (const validator of group) {
          if (!validator || !validator.source || !validator.field) continue;
          const { schema } = validator.get();
          const current = grouped[validator.source][validator.field];
          // concat schemas when multiple validators target same field
          grouped[validator.source][validator.field] = current ? current.concat(schema) : schema;
        }
      }
      // Validate each source only if it has any rules
      for (const [source, fields] of Object.entries(grouped)) {
        if (Object.keys(fields).length === 0) continue;

        const schema = Joi.object(fields);
        const { error, value } = schema.validate(req[source], {
          abortEarly: false,
          allowUnknown: true,
        });

        if (error) {
          const formatted = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }));
          return response.invalidated(res, { errors: formatted });
        }

        req[source] = value; // replace sanitized data
      }

      next();
    } catch (err) {
      console.error('Validation error:', err);
      return response.invalidated(res, {
        errors: [{ message: 'Unexpected validation error' }],
      });
    }
  };
};

module.exports = { validate, Joi };