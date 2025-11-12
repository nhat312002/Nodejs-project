const responseUtils = require("utils/responseUtils");
const postService = require("modules/posts/services/postService");

const postController = {
    getPosts: async (req, res) => {
        try {
            const results = await postService.getPosts(req.query);
            return responseUtils.ok(res, results);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    getOwnPosts: async (req, res) => {
        try {
            const results = await postService.getOwnPosts(req.query, req.user.id);
            return responseUtils.ok(res, results);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    getApprovedPosts: async (req, res) => {
        try {
            const results = await postService.getApprovedPosts(req.query);
            return responseUtils.ok(res, results);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    getApprovedPostById: async (req, res) => {
        try {
            const post = await postService.getApprovedPostById(
                req.params.postId
            );
            return responseUtils.ok(res, { post: post });
        } catch (error) {
            if (error.message === "Post not found")
                return responseUtils.notFound(res, error.message);
            return responseUtils.error(res, error.message);
        }
    },

    getOwnPostById: async (req, res) => {
        try {
            const post = await postService.getOwnPostById(
                req.params.postId, req.user.id
            );
            return responseUtils.ok(res, { post: post });
        } catch (error) {
            if (error.message === "Post not found")
                return responseUtils.notFound(res, error.message);
            return responseUtils.error(res, error.message);
        }
    },

    getPostById: async (req, res) => {
        try {
            const post = await postService.getPostById(req.params.postId);
            return responseUtils.ok(res, post);
        } catch (error) {
            if (error.message === "Post not found")
                return responseUtils.notFound(res, error.message);
            return responseUtils.error(res, error.message);
        }
    },

    createPost: async (req, res) => {
        try {
            const userId = req.user?.id || req.body.userId;

            const post = await postService.createPost({
                userId,
                ...req.body,
            });

            return responseUtils.ok(res, { post: post });
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    updatePost: async (req, res) => {
        try {
            const data = req.body;
            const { postId } = req.params;
            const userId = req.user.id;
            const post = await postService.updatePost(postId, userId, data);
            return responseUtils.ok(res, { post: post });
        } catch (error) {
            if (error.message === "Unauthorized")
                return responseUtils.unauthorized(res);
            if (error.message === "Post not found")
                return responseUtils.notFound(res);
            return responseUtils.error(res, error.message);
        }
    },

    disablePost: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user.id;
            const post = await postService.disablePost(postId, userId);
            return responseUtils.ok(res, { post: post });
        } catch (error) {
            if (error.message === "Unauthorized")
                return responseUtils.unauthorized(res);
            if (error.message === "Post not found")
                return responseUtils.notFound(res);
            return responseUtils.error(res, error.message);
        }
    },

    setPostStatus: async (req, res) => {
        try {
            const { postId } = req.params;
            const { status } = req.body;
            const post = await postService.setPostStatus(postId, status);
            return responseUtils.ok(res, { post: post });
        } catch (error) {
            if (error.message === "Post not found")
                return responseUtils.notFound(res);
            return responseUtils.error(res, error.message);
        }
    },
};

module.exports = postController;
