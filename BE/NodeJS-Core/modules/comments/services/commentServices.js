const db = require("models");
const { Comment, Post } = db;

const commentServices = {
    getCommentById: async (id) => {
        return await Comment.findByPk(id);
    },

    getCommentsByPost: async (postId) => {
        return await Comment.findAll({
            where: {
                post_id: postId,
                parent_id: null,
            },
            include: [
                {
                    model: Comment,
                    as: "replies",
                }
            ]
        })
    },

    createComment: async (postId, userId, parentId, content) => {
        const post = await Post.findByPk(postId);
        if (!post) return null;

        let parentComment = null;
        if (parentId != null) {
            parentComment = await Comment.findByPk(parentId);
            if (parentComment == null) return null;

            if (parentComment.parent_id != null) {
                parentId = parentComment.parent_id;
            }
        }

        const comment = await Comment.create({
            post_id: postId,
            user_id: userId,
            parent_id: parentId,
            content
        });

        return comment;
    },

    updateComment: async (id, content) => {
        const comment = await Comment.findByPk(id);
        if (comment == null)
            return null;
        
        if(content !== undefined) comment.content = content;
        await comment.save();

        return comment;
    },

    deleteComment: async (id) => {
        const comment = await Comment.findByPk(id);
        if (comment == null)
            return null;

        deleted = comment.toJSON();
        await comment.destroy();

        return deleted;
    }

}

module.exports = commentServices;