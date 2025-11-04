const db = require("models");
const { Post, Category, Language, User, sequelize } = db;
const { Op, literal } = db.Sequelize;
// const { htmlToText } = require("html-to-text");

const postService = {
    getPostById: async (postId) => {
        // console.log(postId);
        return await Post.findOne({
            where: {
                id: postId,
                status: {
                    [Op.not]: '0'
                }
            }
        });
    },

    getPosts: async (filters) => {
        const DEFAULT_LIMIT = 10;
        const MAX_LIMIT = 100;

        let limit = Number(filters.limit) || DEFAULT_LIMIT;
        limit = Math.min(limit, MAX_LIMIT);

        const page = Number(filters.page) || 1;
        const offset = (page - 1) * limit;

        const { userId, userFullName, title, text, languageId, categoryIds, originalId, status, categoryMatchAll } = filters;

        console.log(filters);

        const attributes = [
            'id',
            'title',
            'body',
            'user_id',
            'original_id',
            'language_id',
            'status',
            'createdAt',
            'updatedAt',
        ];

        const where = {
            status: {
                [Op.not]: '0'
            }
        };

        if (userId) where.user_id = userId;
        if (languageId) where.language_id = languageId;
        if (originalId) where.original_id = originalId;
        if (status) where.status = status;

        let titleRelevanceExpr = null;

        if (title) {
            const escapedTitle = sequelize.escape(title);
            titleRelevanceExpr = `MATCH(\`Post\`.\`title\`) AGAINST (${escapedTitle} IN NATURAL LANGUAGE MODE)`;
            where[Op.and] = literal(titleRelevanceExpr);
            attributes.push([literal(titleRelevanceExpr), 'relevance']);
        }

        let textRelevanceExpr = null;

        if (text) {
            const escapedText = sequelize.escape(text);
            textRelevanceExpr = `MATCH(\`Post\`.\`title\`, \`Post\`.\`body\`) AGAINST (${escapedText} IN NATURAL LANGUAGE MODE)`;
            where[Op.and] = literal(textRelevanceExpr);
            attributes.push([literal(textRelevanceExpr), 'text_relevance']);
        }

        const whereUser = { status: '1' };
        let userRelevanceExpr = null;

        if (userFullName) {
            const escapedName = sequelize.escape(userFullName);
            userRelevanceExpr = `MATCH (\`User\`.\`full_name\`) AGAINST (${escapedName} IN NATURAL LANGUAGE MODE)`;
            whereUser[Op.and] = literal(userRelevanceExpr);
            attributes.push([literal(userRelevanceExpr), 'user_relevance']);
        }


        const whereCategory = {
            status: '1',
        };
        if (categoryIds === "other") {
            where[Op.and] = sequelize.literal(`(
            NOT EXISTS (
            SELECT 1 FROM Posts_Categories pc 
            JOIN Categories c ON pc.category_id = c.id 
            WHERE pc.post_id = Post.id AND c.status = '1'
        )
        )`)
        }
        else if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            idsList = categoryIds.join(',');
            if (categoryMatchAll === true) {
                where.id = {
                    [Op.in]: sequelize.literal(`(
                        SELECT pc.post_id from Posts_Categories pc
                        JOIN Categories c ON pc.category_id = c.id
                        WHERE pc.category_id IN (${idsList}) AND c.status = '1'
                        GROUP BY pc.post_id
                        HAVING COUNT(DISTINCT pc.category_id) = ${categoryIds.length}
                        )`)
                };
            } else 
                where.id = {
                    [Op.in]: sequelize.literal(`(
                            SELECT DISTINCT pc.post_id FROM Posts_Categories pc
                            JOIN Categories c ON pc.category_id = c.id
                            WHERE pc.category_id IN (${idsList}) AND c.status = '1'
                        )`)
                };
            // whereCategory.id = {
            //     [Op.in]: categoryIds
            // };
        }

        const include = [
            {
                model: User,
                where: whereUser,
                attributes: ["id", "full_name"]
            },
            {
                model: Language,
                where: { status: "1" },
                attributes: ["id", "name"]
            },
            {
                model: Category,
                required: (Array.isArray(categoryIds) && categoryIds.length > 0) ? true : false,
                where: whereCategory,
                attributes: ["id", "name"],
                through: { attributes: [] }
            }
        ];

        const order = [];
        if (title) {
            order.push([literal('relevance'), 'DESC']);
        }
        if (userFullName) {
            order.push([literal('user_relevance'), 'DESC']);
        }
        order.push(['createdAt', 'DESC']);

        const { count, rows } = await Post.findAndCountAll({
            where,
            attributes,
            include,
            limit,
            offset,
            distinct: true,
            order,
        });

        const totalPages = Math.ceil(count / limit);

        return {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            posts: rows
        };
    },

    createPost: async (data) => {
        const { title, body, userId, languageId, categoryIds, originalId } = data;
        if (originalId != null) {
            const originalPost = await postService.getPostById(originalId);
            if (originalPost == null) {
                throw new Error("Original post not found");
            }
            if (originalPost.original_id != null) {
                throw new Error("original_id belongs to a child post");
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
            // body_text: htmlToText(body)
        });
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            await post.setCategories(categoryIds);
        }
        return post;
    },

    updatePost: async (id, userId, _body) => {
        const { title, body, categoryIds } = _body;
        const post = await postService.getPostById(id);
        if (!post) {
            throw new Error("Post not found");
        }

        if (post.user_id != userId) {
            throw new Error("Unauthorized");
        }

        if (title !== undefined) post.title = title;
        if (body !== undefined) {
            post.body = body;
            post.body_text = htmlToText(body);
        }
        post.status = '1';
        await post.save();

        if (Array.isArray(categoryIds)) {
            await post.setCategories(categoryIds);
        }

        return post;
    },

    disablePost: async (postId, userId) => {
        const post = await postService.getPostById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if (post.user_id != userId) {
            throw new Error("Unauthorized");
        }
        post.status = "0";
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