// const { body } = require("express-validator");
// const stringUtils = require("utils/stringUtils");

// class WithLocale 
// {
//     constructor(field) {
//         // this.withLocale = body(field)
//         this.field = field;
//     }

//     notEmpty() {
//         this.withLocale = this.withLocale.notEmpty().withMessage(stringUtils.capitalize(this.field) +" must be required").bail()
//         return this
//     }

//     isEmail() {
//         this.withLocale = this.withLocale.isEmail().withMessage(stringUtils.capitalize(this.field)+" is not in correct format").bail()
//         return this
//     }

//     isLength(options) {
//         if (options.min) {
//             this.withLocale = this.withLocale.isLength({min: options.min}).withMessage(stringUtils.capitalize(this.field)+" must be at least " + options.min + " characters long").bail()
//         }

//         if (options.max) {
//             this.withLocale = this.withLocale.isLength({max: options.max}).withMessage(stringUtils.capitalize(this.field)+" must be at most " + options.max + " characters long").bail()
//         }

//         return this;
//     }

//     confirmed(fieldToCompare) {
//         this.withLocale = this.withLocale.custom((value, {req}) => {
//             if (value !== req.body[fieldToCompare]) {
//                 throw new Error(stringUtils.capitalize(this.field) + " and " + fieldToCompare + " do not match");
//             }
//             return true;
//         }).bail();

//         return this;
//     }

//     unique (sequelizeModel, field) {
//         this.withLocale = this.withLocale.custom(async (value) => {
//             const recordExist = await sequelizeModel.findOne({
//                 where: {
//                     [field]:value
//                 }
//             })

//             if (recordExist) {
//                 throw new Error(stringUtils.capitalize(this.field) + " must be unique")
//             }
//         }).bail();

//         return this;
//     }

//     optional() {
//         this.withLocale = this.withLocale.optional();
//         return this;
//     }

//     customSanitizer(sanitizer) {
//         this.withLocale = this.withLocale.customSanitizer(sanitizer);
//         return this;
//     }

//     custom(validator){
//         this.withLocale = this.withLocale.custom(validator).bail();
//         return this;
//     }

//     isString() {
//         this.withLocale = this.withLocale.isString().withMessage(stringUtils.capitalize(this.field)+" must be text").bail()
//         return this;
//     }

//     isNumeric() {
//         this.withLocale = this.withLocale.isNumeric().withMessage(stringUtils.capitalize(this.field)+" must be number").bail()
//         return this;
//     }

//     // isIn(check, against) {
//     //     this.withLocale = this.withLocale.isIn(check, against).withMessage(this.field + " must be in allowable range").bail();
//     //     return this
//     // }

//     isIn(values) {
//         this.withLocale = this.withLocale.isIn(values).withMessage(this.field + " must be in allowable range").bail();
//         return this;
//     }

//     get() {
//         return this.withLocale
//     }

// }

// module.exports = WithLocale

const {Joi} = require("kernels/validations");
const stringUtils = require("utils/stringUtils");

class WithLocale {
  constructor(field) {
    this.field = field;
    this.schema = Joi.any(); // start as a generic schema
    this.source = null; // will be set by subclass (body, params, query)
  }

  // --- Common validation methods ---

  notEmpty() {
    this.schema = this.schema.required().messages({
      "any.required": `${stringUtils.capitalize(this.field)} is required`,
      "string.empty": `${stringUtils.capitalize(this.field)} cannot be empty`,
    });
    return this;
  }

  isEmail() {
    this.schema = Joi.string().email().messages({
      "string.email": `${stringUtils.capitalize(this.field)} is not in correct format`,
    });
    return this;
  }

  isLength(options = {}) {
    let schema = Joi.string();

    if (options.min) {
      schema = schema.min(options.min).messages({
        "string.min": `${stringUtils.capitalize(this.field)} must be at least ${options.min} characters long`,
      });
    }

    if (options.max) {
      schema = schema.max(options.max).messages({
        "string.max": `${stringUtils.capitalize(this.field)} must be at most ${options.max} characters long`,
      });
    }

    this.schema = schema;
    return this;
  }

  confirmed(fieldToCompare) {
    // This will be checked later with Joi.ref()
    this.schema = Joi.valid(Joi.ref(fieldToCompare)).messages({
      "any.only": `${stringUtils.capitalize(this.field)} and ${fieldToCompare} do not match`,
    });
    return this;
  }

  unique(sequelizeModel, field) {
    this.schema = this.schema.external(async (value) => {
      const recordExist = await sequelizeModel.findOne({
        where: { [field]: value },
      });

      if (recordExist) {
        throw new Error(`${stringUtils.capitalize(this.field)} must be unique`);
      }

      return value;
    });
    return this;
  }

  optional() {
    this.schema = this.schema.optional();
    return this;
  }

  custom(validator) {
    this.schema = this.schema.custom((value, helpers) => {
      try {
        const result = validator(value, helpers);
        return result === undefined ? value : result;
      } catch (err) {
        throw new Error(
          err.message || `${stringUtils.capitalize(this.field)} is invalid`
        );
      }
    });
    return this;
  }

  isString() {
    this.schema = Joi.string().messages({
      "string.base": `${stringUtils.capitalize(this.field)} must be text`,
    });
    return this;
  }

  isNumeric() {
    this.schema = Joi.number().messages({
      "number.base": `${stringUtils.capitalize(this.field)} must be a number`,
    });
    return this;
    // Convert string to number for query params
    // this.schema = Joi.alternatives().try(
    //     Joi.number(),
    //     Joi.string().custom((value, helpers) => {
    //         const num = Number(value);
    //         if (Number.isNaN(num)) {
    //             return helpers.error('number.base');
    //         }
    //         return num;
    //     })
    // ).messages({
    //     "number.base": `${stringUtils.capitalize(this.field)} must be a number`,
    // });
    return this;
  }

  isIn(values) {
    this.schema = Joi.valid(...values).messages({
      "any.only": `${stringUtils.capitalize(this.field)} must be in allowable range`,
    });
    return this;
  }

  // --- Output for validator ---
  get() {
    return {
      field: this.field,
      schema: this.schema,
      source: this.source, // set by subclass
    };
  }
}

module.exports = WithLocale;
