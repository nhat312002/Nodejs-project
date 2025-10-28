// const { body } = require("express-validator");
const { Joi } = require("kernels/validations");
const WithLocale = require("kernels/rules/base");

class BodyWithLocale extends WithLocale 
{
    constructor(field) {
        super(field)
        // this.withLocale = body(field)
        this.source = "body"
    }
}

module.exports = BodyWithLocale