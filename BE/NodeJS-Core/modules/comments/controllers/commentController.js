const responseUtils = require("utils/responseUtils");
const commentServices = require("modules/comments/services/commentServices");

const commentController = {
    getCommentById: async (req, res) => {
        try {
            const commentId = req.query.commentId || req.params.commentId;
            if (!commentId)
                return responseUtils.error(res, "commentId is required");
            const comment = await commentServices.getCommentById(commentId);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    getCommentsByPost: async (req, res) => {
        try {
            const postId = req.query.postId || req.params.postId;
            if (!postId)
                return responseUtils.error(res, "postId is required");
            const comments = await commentServices.getCommentsByPost(postId);
            return responseUtils.ok(res, {data: comments});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }

    },

    createComment: async (req, res) => {
        try {
            const postId = req.query.postId || req.params.postId;
            const userId = req.user?.id || req.query.userId;
            const parentId = req.query.parentId || null;
            const content = req.body.content;
            const comment = await commentServices.createComment(postId, userId, parentId, content);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    updateComment: async (req, res) => {
        try {
            const commentId = req.params.id;
            const content = req.body.content;
            const comment = await commentServices.updateComment(commentId, content);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    deleteComment: async (req, res) => {
        try {
            const commentId = req.params.id;
            const deleted = await commentServices.deleteComment(commentId);
            if (!deleted)
                return responseUtils.notFound(res, 'Comment not found');
            return responseUtils.ok(res, {data: deleted});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    
}

module.exports = commentController;