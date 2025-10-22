const db = require("models");
const { Comment, Post } = db;
const postService = require("modules/posts/services/postService");

const commentServices = {
    getCommentById: async (id) => {
        return await Comment.findByPk(id);
    },

    getCommentsByPost: async (postId) => {
        const post = await postService.getPostById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        return await Comment.findAll({
            where: {
                post_id: postId,
                parent_id: null,
            },
            include: [
                {
                    model: Comment,

                }
            ]
        })
    },

    createComment: async (postId, userId, parentId, content) => {
        const post = await postService.getPostById(postId);
        if (!post) throw new Error("Post not found");

        let parentComment = null;
        if (parentId != null) {
            parentComment = await Comment.findByPk(parentId);
            if (parentComment == null) throw new Error("Parent comment not found");
            if (parentComment.post_id.toString() !== postId.toString()) {
                throw new Error("Parent comment does not belong to this post");
            }
            if (parentComment.parent_id != null) {
                parentId = parentComment.parent_id;
            }
        }

        const comment = await Comment.create({
            post_id: postId,
            user_id: userId,
            parent_id: parentId,
            content: content,
        });

        return comment;
    },

    updateComment: async (id, content, userId) => {
        const comment = await Comment.findByPk(id);
        if (comment == null)
            throw new Error("Comment not found");
        if (comment.user_id != userId)
            throw new Error("Unauthorized");
        if(content !== undefined) comment.content = content;
        await comment.save();

        return comment;
    },

    deleteComment: async (id, userId) => {
        const comment = await Comment.findByPk(id);
        if (comment == null)
            throw new Error("Comment not found");
        if (comment.user_id != userId)
            throw new Error("Unauthorized");
        deleted = comment.toJSON();
        await comment.destroy();

        return deleted;
    }

}

module.exports = commentServices;