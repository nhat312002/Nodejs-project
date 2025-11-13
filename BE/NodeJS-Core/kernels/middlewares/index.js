const authenticated = require("./authMiddleware");
const role = require("./roleMiddleware");

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