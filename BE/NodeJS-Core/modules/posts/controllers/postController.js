const responseUtils = require("utils/responseUtils")
const postServices = require("modules/posts/services/postServices");

const postController = {
    getPosts: async (req, res) => {
        try {
            const posts = await postServices.getPosts();
            return responseUtils.ok(res, { data: posts });
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    getPostsByLanguage: async (req, res) => {
        try {
            const posts = await postServices.getPostsByLanguage(req.query.languageId);
            return responseUtils.ok(res, { data: posts });
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    getPostsByLanguageAndCategories: async (req, res) => {
        try {
            const posts = await postServices.getPostsByLanguageAndCategories(req.query.languageId, req.query.categoryIds);
            return responseUtils.ok(res, { data: posts });
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    createPost: async (req, res) => {
        try {
            const { title, body, languageId, categoryIds } = req.body;

            const userId = req.user?.id || req.body.userId;

            const post = await postServices.createPost({
                title,
                body,
                userId,
                languageId,
                categoryIds,
            });

            return responseUtils.ok(res, {data: post});
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    updatePost: async (req, res) => {
        try {
            const { title, body, categoryIds } = req.body;

            const post = await postServices.updatePost(req.params.id, { title, body, categoryIds });
            if (post == null) {
                return responseUtils.notFound(res);
            }

            return responseUtils.ok(res, { data: post });
        } catch (error) {
            return responseUtils.error(res);
        }

    },

    disablePost: async (req, res) => {
        try {
            const post = await postServices.disablePost(req.params.id);
            if (post == null) {
                return responseUtils.notFound(res);
            }
            return responseUtils.ok(res);
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    approvePost,

    rejectPost,

}

module.exports = postController;