const responseUtils = require("utils/responseUtils");
const commentService = require("modules/comments/services/commentService");

const commentController = {
    getCommentById: async (req, res) => {
        try {
            const {commentId} = req.params;
            const comment = await commentService.getCommentById(commentId);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    getCommentsByPost: async (req, res) => {
        try {
            const {postId} = req.query;
            const comments = await commentService.getCommentsByPost(postId);
            return responseUtils.ok(res, {data: comments});
        } catch (error) {
            if (error.message === "Post not found") {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }

    },

    createComment: async (req, res) => {
        try {
            const postId = req.query.postId;
            const userId = req.user?.id || req.body.userId;
            const parentId = req.query.parentId || null;
            const content = req.body.content;
            const comment = await commentService.createComment(postId, userId, parentId, content);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    updateComment: async (req, res) => {
        try {
            const commentId = req.params.commentId;
            const content = req.body.content;
            const comment = await commentService.updateComment(commentId, content);
            return responseUtils.ok(res, {data: comment});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    deleteComment: async (req, res) => {
        try {
            const commentId = req.params.commentId;
            const deleted = await commentService.deleteComment(commentId);
            if (!deleted)
                return responseUtils.notFound(res, 'Comment not found');
            return responseUtils.ok(res, {data: deleted});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },


}

module.exports = commentController;