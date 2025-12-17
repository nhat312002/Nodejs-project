const db = require("models");
const { Comment, Post, User } = db;
const postService = require("modules/posts/services/postService");

const commentServices = {
    getCommentById: async (id) => {
        return await Comment.findByPk(id);
    },

    getCommentsByPost: async (data) => {
        const limit = 10;
        const { postId, approvedOnly, userId } = data;
        const page = Number(data.page) || 1;
        const offset = (page - 1) * limit;
        const post = await postService.getPostById(postId);

        if (!post) {
            throw new Error("Post not found");
        }
        if (approvedOnly && post.status != '2') {
            throw new Error("Post not found");
        }
        if (userId && post.user_id != userId)
            throw new Error("Post not found");

        const { count, rows } = await Comment.findAndCountAll({
            attributes: [
                'id',
                ['post_id', 'postId'],
                ['user_id', 'userId'],
                ['parent_id', 'parentId'],
                'content',
                'createdAt',
                'updatedAt',
            ],
            where: {
                post_id: postId,
                parent_id: null,
            },
            include: [
                {
                    model: Comment,
                    as: "replies",
                    attributes: [
                        'id',
                        ['post_id', 'postId'],
                        ['user_id', 'userId'],
                        ['parent_id', 'parentId'],
                        'content',
                        'createdAt',
                        'updatedAt',
                    ],
                    include: [
                        {
                            model: User,
                            as: "user",
                            where: {
                                status: '1'
                            },
                            required: false, 
                            attributes: ['id', ['full_name', 'fullName']]
                        }
                    ]
                },
                {
                    model: User,
                    as: "user",
                    where: {
                        status: '1'
                    },
                    attributes: ['id', ['full_name', 'fullName']]
                },
            ],
            limit,
            offset,
            order: [
                ['createdAt', 'DESC']
            ]
        });

        const totalPages = Math.ceil(count / limit);
        return {
            pagination: {
                totalRecords: count,
                totalPages: totalPages,
                currentPage: page,
            },
            comments: rows
        }
    },

    createComment: async (data) => {
        const { postId, userId, parentId, content } = data;
        const post = await postService.getApprovedPostById(postId);
        if (!post) throw new Error("Post not found");

        let parentComment = null;
        if (parentId != null) {
            parentComment = await Comment.findByPk(parentId);
            if (parentComment == null) throw new Error("Parent comment not found");
            if (parentComment.post_id.toString() !== postId.toString()) {
                throw new Error("Parent comment does not belong to this post");
            }
            if (parentComment.parent_id != null) {
                throw new Error("Parent comment already had a parent")
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

    updateComment: async (data) => {
        const { commentId, content, userId } = data;
        const comment = await Comment.findByPk(commentId);
        if (comment == null)
            throw new Error("Comment not found");
        if (comment.user_id != userId)
            throw new Error("Unauthorized");
        comment.content = content;
        await comment.save();

        return comment;
    },

    deleteComment: async (data) => {
        const { commentId, userId, userRoleId } = data;
        const comment = await Comment.findByPk(commentId);
        if (comment == null)
            throw new Error("Comment not found");
        if (comment.user_id != userId) {
            if (userRoleId != '3')
                throw new Error("Insufficient permissions");
            else throw new Error("Unauthorized");
        }
        deleted = comment.toJSON();
        await comment.destroy();

        return deleted;
    }

}

module.exports = commentServices;