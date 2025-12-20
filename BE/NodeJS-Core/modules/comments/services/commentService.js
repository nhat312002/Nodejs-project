const db = require("models");
const { Comment, Post, User } = db;
const { Op } = db.Sequelize;
const postService = require("modules/posts/services/postService");

const commentServices = {
    getCommentById: async (id) => {
        return await Comment.findByPk(id);
    },

    getCommentsByPost: async (data) => {
        const { postId, approvedOnly, userId, cursor } = data; // cursor is the last ID seen
        const limit = parseInt(data.limit) || 10;

        // 1. Validate Post Access
        const post = await postService.getPostById(postId);
        if (!post) throw new Error("Post not found");
        if (approvedOnly && post.status != '2') throw new Error("Post not found");
        if (userId && post.user_id != userId) throw new Error("Post not found");

        // 2. Build Where Clause
        const where = {
            post_id: postId,
            parent_id: null, // Only fetch parents
        };

        // CURSOR LOGIC: If cursor exists, get items with ID < cursor (assuming DESC order)
        if (cursor) {
            where.id = { [Op.lt]: cursor };
        }

        // 3. Query
        const comments = await Comment.findAll({
            attributes: [
                'id',
                ['post_id', 'postId'],
                ['user_id', 'userId'],
                ['parent_id', 'parentId'],
                'content',
                'createdAt',
                'updatedAt',
            ],
            where: where,
            include: [
                {
                    model: User,
                    as: "user",
                    required: false, // Left Join (safe if user deleted)
                    where: { status: '1' },
                    attributes: ['id', ['full_name', 'fullName'], ['url_avatar', 'avatarUrl']]
                },
                // OPTIONAL: Include Reply COUNT only (Lightweight)
                // If you want to show "View 5 replies", you need a count.
                // Doing a full include of replies here is bad for performance.
            ],
            limit: limit + 1, // Fetch 1 extra to check if there is a next page
            order: [['id', 'DESC']] // Use ID for cursor (it's unique and sequential)
        });

        // 4. Calculate Next Cursor
        let nextCursor = null;
        if (comments.length > limit) {
            const nextItem = comments.pop(); // Remove the extra item
            nextCursor = nextItem.id; // The cursor for next call is the ID of the extra item (or last item)
            // Actually, for correct logic:
            // The cursor for the NEXT page is the ID of the LAST item in the CURRENT valid set.
            // But since we fetched limit+1, we know there is more.
            // So we return the ID of the last item in the *returned* list (index limit-1).
            nextCursor = comments[comments.length - 1].id;
        }

        return {
            comments: comments,
            meta: {
                nextCursor,
                hasMore: nextCursor !== null
            }
        };
    },

    getReplies: async (data) => {
        const { parentId, cursor, userId, userRoleId } = data; // userRoleId to check admin access
        const limit = parseInt(data.limit) || 10;

        // 1. Validate Parent & Post Access
        const parent = await Comment.findByPk(parentId);
        if (!parent) throw new Error("Parent comment not found");

        const post = await postService.getPostById(parent.post_id);
        
        // Security Check: Can this user see the post?
        // If post is not approved (status != 2), only Owner/Admin/Mod can see replies
        if (post.status != '2') {
            const isOwner = post.user_id == userId;
            const isAdminOrMod = userRoleId == 2 || userRoleId == 3;
            if (!isOwner && !isAdminOrMod) {
                 throw new Error("Unauthorized");
            }
        }

        // 2. Build Where Clause
        const where = {
            parent_id: parentId
        };

        // CURSOR LOGIC:
        // Replies are usually sorted ASC (Oldest first) for reading flow, 
        // OR DESC (Newest first). Let's stick to DESC (Newest) to match your parents.
        // If you want ASC, change Op.lt to Op.gt (Greater Than)
        if (cursor) {
            where.id = { [Op.lt]: cursor };
        }

        // 3. Query
        const replies = await Comment.findAll({
            attributes: [
                'id',
                ['post_id', 'postId'],
                ['user_id', 'userId'],
                ['parent_id', 'parentId'],
                'content',
                'createdAt',
                'updatedAt',
            ],
            where: where,
            include: [
                {
                    model: User,
                    as: "user",
                    required: false,
                    where: { status: '1' },
                    attributes: ['id', ['full_name', 'fullName'], 'avatar_url']
                }
            ],
            limit: limit + 1, // Fetch 1 extra
            order: [['id', 'DESC']]
        });

        // 4. Calculate Next Cursor
        let nextCursor = null;
        if (replies.length > limit) {
            replies.pop(); // Remove extra
            nextCursor = replies[replies.length - 1].id;
        }

        return {
            comments: replies, // These are replies
            meta: {
                nextCursor,
                hasMore: nextCursor !== null
            }
        };
    },

    _getCommentsByPost: async (data) => {
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