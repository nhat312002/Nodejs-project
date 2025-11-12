const authenticated = require("./authenticated");
const role = require("./role");

const middlewares = (middlewareArray) => {
    return [
        ...middlewareArray
    ]
}

module.exports = {
    middlewares,
    authenticated,
    role
}