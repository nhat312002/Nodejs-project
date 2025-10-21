const db = require("models");
const { Post, Category, Language, User } = db;
const { Op } = db.Sequelize;

const postService = {
    getPostById: async (postId) => {
        return await Post.findOne({
            where: {
                id: postId,
                status: {
                    [Op.not]: 'deleted'
                }
            }
        });
    },

    getPosts: async (filters = {}) => {
        const { userId, languageId, categoryIds, originalId, status } = filters;
        const where = {
            status: {
                [Op.not]: 'deleted'
            }
        };

        if (userId) where.user_id = userId;
        if (languageId) where.language_id = languageId;
        if (originalId) where.original_id = originalId;
        if (status) where.status = status;

        const include = [];
        
        include.push({
            model: User,
            where: {status: "active"},
            attributes: ["full_name"]
        })

        include.push({
            model: Language,
            where: {status: "active"},
            attributes: ["name"]
        })
        
        const whereCategory = {
            status: 'active',
        };
        if (categoryIds && categoryIds.length > 0) {
            whereCategory.id = {
                [Op.in]: categoryIds
            }
        }

        include.push({
            model: Category,
            where: whereCategory,
            through: { attributes: [] },
            attributes: ["name"]
        });

        return await Post.findAll({
            where,
            include
        }
        );
    },

    createPost: async ({ title, body, userId, languageId, categoryIds, originalId }) => {
        if (originalId != null) {
            let originalPost = await postService.getPostById(originalId);
            if (originalPost == null) {
                throw new Error("Original post not found");
            }
            if (originalPost.original_id != null) {
                originalPost = postService.getPostById(originalPost.originalId);
            }
            if (originalPost.language_id === languageId)
                throw new Error("Original post is already in this language.");
        }
        const post = await Post.create({
            title: title,
            body: body,
            user_id: userId,
            language_id: languageId,
            original_id: originalId,
        });
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            await post.setCategories(categoryIds);
        }
        return post;
    },

    updatePost: async (id, userId, title, body, categoryIds ) => {
        const post = await postService.getPostById(id);
        if (!post) {
            throw new Error("Post not found");
        }
        
        if (post.user_id != userId) {
            throw new Error("Unauthorized");
        }

        if (title !== undefined) post.title = title;
        if (body !== undefined) post.body = body;
        post.status = 'pending';
        await post.save();

        if (Array.isArray(categoryIds)) {
            await post.setCategories(categoryIds);
        }

        return post;
    },

    disablePost: async (postId) => {
        const post = await postService.getPostById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        post.status = "deleted";
        await post.save();
        return post;
    },

    // approve or reject posts
    setPostStatus: async (id, status) => {
        const post = await postService.getPostById(id);
        if (!post) {
            throw new Error("Post not found");
        }
        post.status = status;
        await post.save();
        return post;
    }
};

module.exports = postService;