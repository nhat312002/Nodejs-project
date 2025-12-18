const authenticated = require("./authMiddleware");
const role = require("./roleMiddleware");
const { avatarUpload, flagUpload, thumbnailUpload, postImageUpload } = require("./uploadMiddleware");

const middlewares = (middlewareArray) => {
    return [
        ...middlewareArray
    ]
}

module.exports = {
    middlewares,
    authenticated,
    role,
    avatarUpload, flagUpload, thumbnailUpload, postImageUpload
}