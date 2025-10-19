const responseUtils = require("utils/responseUtils")
const postService = require("modules/posts/services/postService");

const postController = {
    getPosts: async (req, res) => {
        try {
            const { userId, languageId, categoryIds, originalId, status } = req.query;
            const posts = await postService.getPosts({ userId, languageId, categoryIds, originalId, status });
            return responseUtils.ok(res, { data: posts });
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    getPostById: async (req, res) => {
        try {
            const { postId } = req.params
            const post = await postService.getPostById(postId);
            return responseUtils.ok(res, { data: post });
        } catch (error) {
            return responseUtils.error(res);
        }
    },

    createPost: async (req, res) => {
        try {
            const { title, body, languageId, categoryIds, originalId } = req.body;

            const userId = req.user?.id;

            const post = await postService.createPost({
                title,
                body,
                userId,
                languageId,
                categoryIds,
                originalId
            });

            return responseUtils.ok(res, { data: post });
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    updatePost: async (req, res) => {
        try {
            const { title, body, categoryIds } = req.body;
            const {postId} = req.params;
            const post = await postService.updatePost(postId, { title, body, categoryIds });
            return responseUtils.ok(res, { data: post });
        } catch (error) {
            if (error.message === "Post not found") return responseUtils.notFound(res);
            return responseUtils.error(res);
        }

    },

    disablePost: async (req, res) => {
        try {
            const { postId } = req.params
            const post = await postService.disablePost(postId);
            return responseUtils.ok(res, { data: post });
        } catch (error) {
            if (error.message === "Post not found") return responseUtils.notFound(res);
            return responseUtils.error(res);
        }
    },

    setPostStatus: async (req, res) => {
        try {
            const { postId } = req.params;
            const { status } = req.body;
            const post = await postService.setPostStatus(postId, status);
            return responseUtils.ok(res, { data: post });
        } catch (error) {
            if (error.message === "Post not found") return responseUtils.notFound(res);
            return responseUtils.error(res);
        }
    },

}

module.exports = postController;