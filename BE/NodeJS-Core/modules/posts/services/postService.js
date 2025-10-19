const db = require("models");
const { Post, Category } = db;
const { Op } = db.Sequelize;

const postService = {
    getPostById: async (postId) => {
        return await Post.findOne({
            where: {
                id: postId,
                status: {
                    [Op.not]: 'disabled'
                }
            }
        });
    },

    getPosts: async (filters = {}) => {
        const { userId, languageId, categoryIds, originalId, status} = filters;
        const where = {
            status: {
                [Op.not]: 'disabled'
            }
        };

        if (userId) where.user_id = userId;
        if (languageId) where.language_id = languageId;
        if (originalId) where.original_id = originalId;
        if (status) where.status = status;
        const include = [];
        if (categoryIds && categoryIds.length > 0) {
            include.push({
                model: Category,
                where: {
                    id: {
                        [Op.in]: categoryIds
                    }
                },
                through: { attributes: [] },
            });
        }

        return await Post.findAll({
            where,
            include
        }
        );
    },

    createPost: async ({ title, body, userId, languageId, categoryIds, originalId }) => {
        if (originalId != null){
            let originalPost = await postService.getPostById(originalId);
            if (originalPost == null){
                throw new Error("Original post not found");
            }
            if (originalPost.original_id != null){
                originalPost = postService.getPostById(originalId);
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

    updatePost: async (id, { title, body, categoryIds }) => {
        const post = await postService.getPostById(id);
        if (!post) {
            throw new Error("Post not found");
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

    disablePost: async (id) => {
        const post = await postService.getPostById(id);
        if (!post) {
            throw new Error("Post not found");
        }
        post.status = 'disabled';
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