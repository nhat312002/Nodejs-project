// const { query } = require("express-validator");
const { Joi } = require("kernels/validations");
const WithLocale = require("kernels/rules/base");

class QueryWithLocale extends WithLocale {
    constructor(field) {
        super(field)
        // this.withLocale = query(field)
        this.source = "query"
    }

    // matches(regex) {
    //     this.withLocale = this.withLocale.matches(regex)
    //     return this;
    // }

    matches(regex) {
        // ensure schema is a string before applying regex
        this.schema = Joi.string()
            .pattern(regex)
            .messages({
                "string.pattern.base": `${stringUtils.capitalize(this.field)} is not in correct format`,
            });
        return this;
    }
}

module.exports = QueryWithLocale