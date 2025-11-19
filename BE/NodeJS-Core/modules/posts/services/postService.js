const db = require("models");
const { Post, Category, Language, User, sequelize } = db;
const { Op, literal } = db.Sequelize;
// const { htmlToText } = require("html-to-text");

const postService = {
    getPostById: async (postId) => {
        // console.log(postId);
        const post = await Post.findOne({
            where: {
                id: postId,
                status: {
                    [Op.not]: '0'
                }
            }
        });

        if (!post) throw new Error("Post not found");
        return post;
    },

    getApprovedPostById: async (postId) => {
        // console.log(postId);
        const post = await Post.findOne({
            where: {
                id: postId,
                status: '2'
            }
        });
        if (!post) throw new Error("Post not found");
        return post;
    },

    getOwnPostById: async (postId, userId) => {
        const post = await Post.findOne({
            where: {
                id: postId,
                user_id: userId
            }
        });
        if (!post) throw new Error("Post not found");
        return post;
    },

    getPosts: async (filters) => {
        const DEFAULT_LIMIT = 10;
        const MAX_LIMIT = 100;

        let limit = Number(filters.limit) || DEFAULT_LIMIT;
        limit = Math.min(limit, MAX_LIMIT);

        const page = Number(filters.page) || 1;
        const offset = (page - 1) * limit;

        const { userId, userFullName, title, text, languageId, categoryIds, originalId, status, categoryMatchAll, sort } = filters;

        console.log(filters);

        const attributes = [
            'id',
            'title',
            'body',
            ['user_id', 'userId'],
            ['original_id', 'originalId'],
            ['language_id', 'languageId'],
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
            const booleanSearchString = userFullName
                .trim()
                .split(/\s+/)
                .map(word => `+${word}*`)
                .join(' ');
            const escapedName = sequelize.escape(booleanSearchString);
            userRelevanceExpr = `MATCH (\`User\`.\`full_name\`) AGAINST (${escapedName} IN BOOLEAN MODE)`;
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
                as: "user",
                where: whereUser,
                attributes: ["id", ["full_name", "fullName"]]
            },
            {
                model: Language,
                as: "language",
                where: { status: "1" },
                attributes: ["id", "name", "locale"]
            },
            {
                model: Category,
                as: "categories",
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
        const sortOptions = {
            date_asc: ['createdAt', 'ASC'],
            date_desc: ['createdAt', 'DESC'],
            title_asc: ['title', 'ASC'],
            title_desc: ['title', 'DESC'],
        };
        if (sort)
            order.push(sortOptions[sort]);
        else order.push(['createdAt', 'DESC']);

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
            pagination: {
                totalRecords: count,
                totalPages: totalPages,
                currentPage: page,
            },
            posts: rows
        };
    },

    getApprovedPosts: async (filters) => {
        const merged = Object.assign({}, filters, { status: '2' });
        return await postService.getPosts(merged);
    },

    getOwnPosts: async (filters, userId) => {
        const merged = Object.assign({}, filters, { userId: userId });
        return await postService.getPosts(merged);
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

            const existingCategories = await Category.findAll({
                where: {
                    id: categoryIds
                },
                attributes: ['id']
            });

            const existingIds = new Set(existingCategories.map(cat => cat.id));
            const nonExistentIds = categoryIds.filter(id => !existingIds.has(id));
            if (nonExistentIds.length > 0) {
                const errorMessage = `The following Category IDs do not exist: ${nonExistentIds.join(', ')}`;
                throw new Error(errorMessage);
            }
            await post.setCategories(...existingIds);
        }
        return post;
    },

    updatePost: async (id, userId, data) => {
        const { title, body, categoryIds } = data;
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
            // post.body_text = htmlToText(body);
        }
        post.status = '1';
        await post.save();

        if (Array.isArray(categoryIds) && categoryIds.length > 0) {

            const existingCategories = await Category.findAll({
                where: {
                    id: categoryIds
                },
                attributes: ['id']
            });

            const existingIds = new Set(existingCategories.map(cat => cat.id));
            const nonExistentIds = categoryIds.filter(id => !existingIds.has(id));
            if (nonExistentIds.length > 0) {
                const errorMessage = `The following Category IDs do not exist: ${nonExistentIds.join(', ')}`;
                throw new Error(errorMessage);
            }
            await post.setCategories(...existingIds);
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