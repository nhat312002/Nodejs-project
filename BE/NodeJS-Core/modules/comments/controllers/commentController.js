const responseUtils = require("utils/responseUtils");
const commentService = require("modules/comments/services/commentService");

const commentController = {
    getCommentsByApprovedPost: async (req, res) => {
        try {
            const results = await commentService.getCommentsByPost({approvedOnly: true, ...req.query});
            return responseUtils.ok(res, results);
        } catch (error) {
            if (error.message === "Post not found") {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }
    },

    getCommentsByOwnPost: async (req, res) => {
        try {
            const results = await commentService.getCommentsByPost({userId: req.user.id, ...req.query});
            return responseUtils.ok(res, results);
        } catch (error) {
            if (error.message === "Post not found") {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }

    },

    getCommentsByPost: async (req, res) => {
        try {
            const results = await commentService.getCommentsByPost(req.query);
            return responseUtils.ok(res, results );
        } catch (error) {
            if (error.message === "Post not found") {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.error(res, error.message);
        }

    },

    createComment: async (req, res) => {
        try {
            const commentData = {
                postId: req.body.postId,
                userId: req.user.id,
                parentId: req.body.parentId || null,
                content: req.body.content
            };
            const comment = await commentService.createComment(commentData);
            return responseUtils.ok(res, { created_comment: comment });
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    updateComment: async (req, res) => {
        try {
            const commentId = req.params.commentId;
            const { content } = req.body;
            const userId = req.user.id;
            
            const comment = await commentService.updateComment({commentId, content, userId});
            return responseUtils.ok(res, { updated_comment: comment });
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },

    deleteComment: async (req, res) => {
        try {
            const commentId = req.params.commentId;
            const userId = req.user.id;
            const userRoleId = req.user.role_id;
            const deleted = await commentService.deleteComment({commentId, userId, userRoleId});
            
            return responseUtils.ok(res, { deleted_comment: deleted });
        } catch (error) {
            if (error.message === "Unauthorized") responseUtils.unauthorized(res);
            if (error.message === "Comment not found") responseUtils.notFound(res);
            return responseUtils.error(res, error.message);
        }
    },


}

module.exports = commentController;