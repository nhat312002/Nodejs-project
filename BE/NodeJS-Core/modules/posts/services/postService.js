const db = require("models");
const { Post, Category, Language, User, sequelize } = db;
const { Op, literal } = db.Sequelize;
// const { htmlToText } = require("html-to-text");

const postService = {
    getPostById: async (postId) => {
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
        // console.log(postId);
        const post = await Post.findOne({
            where: {
                id: postId,
                status: {
                    [Op.not]: '0'
                }
            },
            attributes,
        });

        if (!post) throw new Error("Post not found");
        return post;
    },

    getApprovedPostById: async (postId) => {
        // console.log(postId);
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
        const include = [
            {
                model: User,
                as: "user",
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
                required: false,
                attributes: ["id", "name"],
                through: { attributes: [] }
            }
        ];
        const post = await Post.findOne({
            where: {
                id: postId,
                status: '2'
            },
            attributes,
            include,
        });
        if (!post) throw new Error("Post not found");
        return post;
    },

    getOwnPostById: async (postId, userId) => {
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
        const post = await Post.findOne({
            where: {
                id: postId,
                user_id: userId
            },
            attributes,
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

        const { userId, userFullName, title, text, languageId, locale, categoryIds, originalId, status, categoryMatchAll, sort } = filters;

        // --- 1. SETUP BASE ATTRIBUTES & INCLUDES ---
        // These do not change between FTS and LIKE queries
        let attributes = [
            'id', 'title', 'body',
            ['user_id', 'userId'],
            ['original_id', 'originalId'],
            ['language_id', 'languageId'],
            'status', 'createdAt', 'updatedAt',
        ];

        const include = [
            {
                model: User,
                as: "user",
                where: { status: '1' },
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
                required: (Array.isArray(categoryIds) && categoryIds.length > 0),
                where: { status: '1' },
                attributes: ["id", "name"],
                through: { attributes: [] }
            }
        ];

        // --- 2. SETUP BASE WHERE CLAUSE ---
        const baseWhere = {
            status: { [Op.not]: '0' }
        };

        if (userId) baseWhere.user_id = userId;
        if (languageId) baseWhere.language_id = languageId;
        if (originalId) baseWhere.original_id = originalId;
        if (status) baseWhere.status = status;

        // Handle Locale
        if (locale) {
            include[1].where.locale = locale;
        }

        // Handle User Search (Boolean Mode is fine, usually keeps working)
        if (userFullName) {
            const booleanSearchString = userFullName.trim().split(/\s+/).map(word => `+${word}*`).join(' ');
            const escapedName = sequelize.escape(booleanSearchString);
            const userRelevanceExpr = `MATCH (\`User\`.\`full_name\`) AGAINST (${escapedName} IN BOOLEAN MODE)`;

            include[0].where[Op.and] = literal(userRelevanceExpr);
            attributes.push([literal(userRelevanceExpr), 'userRelevance']);
        }

        // Handle Category Logic (Keep your existing logic)
        if (categoryIds === "other") {
            baseWhere[Op.and] = sequelize.literal(`(
            NOT EXISTS (
            SELECT 1 FROM Posts_Categories pc 
            JOIN Categories c ON pc.category_id = c.id 
            WHERE pc.post_id = Post.id AND c.status = '1'
        ))`);
        } else if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            const idsList = categoryIds.join(',');
            if (categoryMatchAll === true) {
                baseWhere.id = {
                    [Op.in]: sequelize.literal(`(
                    SELECT pc.post_id from Posts_Categories pc
                    JOIN Categories c ON pc.category_id = c.id
                    WHERE pc.category_id IN (${idsList}) AND c.status = '1'
                    GROUP BY pc.post_id
                    HAVING COUNT(DISTINCT pc.category_id) = ${categoryIds.length}
                )`)
                };
            } else {
                baseWhere.id = {
                    [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT pc.post_id FROM Posts_Categories pc
                    JOIN Categories c ON pc.category_id = c.id
                    WHERE pc.category_id IN (${idsList}) AND c.status = '1'
                )`)
                };
            }
        }

        // --- 3. EXECUTE QUERY (Attempt 1: Full Text Search) ---

        // Clone the base where for FTS
        const ftsWhere = { ...baseWhere };
        const ftsAttributes = [...attributes];
        const ftsOrder = []; // Build specific order for FTS

        // Add FTS Logic
        if (title) {
            const escapedTitle = sequelize.escape(title);
            const titleExpr = `MATCH(\`Post\`.\`title\`) AGAINST (${escapedTitle} IN NATURAL LANGUAGE MODE)`;
            // Use Op.and to avoid overwriting if category logic also used Op.and
            ftsWhere[Op.and] = ftsWhere[Op.and] ? [ftsWhere[Op.and], literal(titleExpr)] : literal(titleExpr);
            ftsAttributes.push([literal(titleExpr), 'titleRelevance']);
            ftsOrder.push([literal('titleRelevance'), 'DESC']);
        }

        if (text) {
            const escapedText = sequelize.escape(text);
            const textExpr = `MATCH(\`Post\`.\`title\`, \`Post\`.\`body\`) AGAINST (${escapedText} IN NATURAL LANGUAGE MODE)`;
            ftsWhere[Op.and] = ftsWhere[Op.and] ? [ftsWhere[Op.and], literal(textExpr)] : literal(textExpr);
            ftsAttributes.push([literal(textExpr), 'textRelevance']);
            ftsOrder.push([literal('textRelevance'), 'DESC']);
        }

        // Standard Sorting
        const sortOptions = {
            date_asc: ['createdAt', 'ASC'],
            date_desc: ['createdAt', 'DESC'],
            title_asc: ['title', 'ASC'],
            title_desc: ['title', 'DESC'],
        };

        // If user provided specific sort, use it. Otherwise use Relevance, then Date.
        if (sort) ftsOrder.push(sortOptions[sort]);
        else if (!title && !text) ftsOrder.push(['createdAt', 'DESC']); // Only fallback to date if no search

        let { count, rows } = await Post.findAndCountAll({
            where: ftsWhere,
            attributes: ftsAttributes,
            include,
            limit,
            offset,
            distinct: true,
            order: ftsOrder,
        });

        // --- 4. FALLBACK QUERY (Attempt 2: LIKE) ---
        // If no results AND user was searching for text/title -> Try LIKE
        if (count === 0 && (title || text)) {

            console.log("FTS returned 0. Falling back to LIKE query.");

            const likeWhere = { ...baseWhere };
            const likeOrder = [];

            // Add LIKE logic
            if (title) {
                likeWhere.title = { [Op.like]: `%${title}%` };
            }
            if (text) {
                // Search in Title OR Body
                likeWhere[Op.or] = [
                    { title: { [Op.like]: `%${text}%` } },
                    { body: { [Op.like]: `%${text}%` } }
                ];
            }

            // Standard Sorting (Relevance doesn't exist in LIKE, so fallback to Date)
            if (sort) likeOrder.push(sortOptions[sort]);
            else likeOrder.push(['createdAt', 'DESC']);

            const result = await Post.findAndCountAll({
                where: likeWhere,
                attributes: attributes, // Use base attributes (no relevance columns)
                include,
                limit,
                offset,
                distinct: true,
                order: likeOrder,
            });

            count = result.count;
            rows = result.rows;
        }

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
    
    // getPosts: async (filters) => {
    //     const DEFAULT_LIMIT = 10;
    //     const MAX_LIMIT = 100;

    //     let limit = Number(filters.limit) || DEFAULT_LIMIT;
    //     limit = Math.min(limit, MAX_LIMIT);

    //     const page = Number(filters.page) || 1;
    //     const offset = (page - 1) * limit;

    //     const { userId, userFullName, title, text, languageId, locale, categoryIds, originalId, status, categoryMatchAll, sort } = filters;

    //     console.log(filters);

    //     const attributes = [
    //         'id',
    //         'title',
    //         'body',
    //         ['user_id', 'userId'],
    //         ['original_id', 'originalId'],
    //         ['language_id', 'languageId'],
    //         'status',
    //         'createdAt',
    //         'updatedAt',
    //     ];

    //     const where = {
    //         status: {
    //             [Op.not]: '0'
    //         }
    //     };

    //     if (userId) where.user_id = userId;
    //     if (languageId) where.language_id = languageId;
    //     if (originalId) where.original_id = originalId;
    //     if (status) where.status = status;

    //     let titleRelevanceExpr = null;

    //     if (title) {
    //         const escapedTitle = sequelize.escape(title);
    //         titleRelevanceExpr = `MATCH(\`Post\`.\`title\`) AGAINST (${escapedTitle} IN NATURAL LANGUAGE MODE)`;
    //         where[Op.and] = literal(titleRelevanceExpr);
    //         attributes.push([literal(titleRelevanceExpr), 'titleRelevance']);
    //     }

    //     let textRelevanceExpr = null;

    //     if (text) {
    //         const escapedText = sequelize.escape(text);
    //         textRelevanceExpr = `MATCH(\`Post\`.\`title\`, \`Post\`.\`body\`) AGAINST (${escapedText} IN NATURAL LANGUAGE MODE)`;
    //         where[Op.and] = literal(textRelevanceExpr);
    //         attributes.push([literal(textRelevanceExpr), 'textRelevance']);
    //     }

    //     const whereUser = { status: '1' };
    //     let userRelevanceExpr = null;

    //     if (userFullName) {
    //         const booleanSearchString = userFullName
    //             .trim()
    //             .split(/\s+/)
    //             .map(word => `+${word}*`)
    //             .join(' ');
    //         const escapedName = sequelize.escape(booleanSearchString);
    //         userRelevanceExpr = `MATCH (\`User\`.\`full_name\`) AGAINST (${escapedName} IN BOOLEAN MODE)`;
    //         whereUser[Op.and] = literal(userRelevanceExpr);
    //         attributes.push([literal(userRelevanceExpr), 'userRelevance']);
    //     }

    //     const whereLanguage = { status: "1" };
    //     if (locale) {
    //         whereLanguage.locale = locale;
    //     }

    //     const whereCategory = {
    //         status: '1',
    //     };
    //     if (categoryIds === "other") {
    //         where[Op.and] = sequelize.literal(`(
    //         NOT EXISTS (
    //         SELECT 1 FROM Posts_Categories pc 
    //         JOIN Categories c ON pc.category_id = c.id 
    //         WHERE pc.post_id = Post.id AND c.status = '1'
    //     )
    //     )`)
    //     }
    //     else if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    //         idsList = categoryIds.join(',');
    //         if (categoryMatchAll === true) {
    //             where.id = {
    //                 [Op.in]: sequelize.literal(`(
    //                     SELECT pc.post_id from Posts_Categories pc
    //                     JOIN Categories c ON pc.category_id = c.id
    //                     WHERE pc.category_id IN (${idsList}) AND c.status = '1'
    //                     GROUP BY pc.post_id
    //                     HAVING COUNT(DISTINCT pc.category_id) = ${categoryIds.length}
    //                     )`)
    //             };
    //         } else
    //             where.id = {
    //                 [Op.in]: sequelize.literal(`(
    //                         SELECT DISTINCT pc.post_id FROM Posts_Categories pc
    //                         JOIN Categories c ON pc.category_id = c.id
    //                         WHERE pc.category_id IN (${idsList}) AND c.status = '1'
    //                     )`)
    //             };
    //         // whereCategory.id = {
    //         //     [Op.in]: categoryIds
    //         // };
    //     }

    //     const include = [
    //         {
    //             model: User,
    //             as: "user",
    //             where: whereUser,
    //             attributes: ["id", ["full_name", "fullName"]]
    //         },
    //         {
    //             model: Language,
    //             as: "language",
    //             where: whereLanguage,
    //             attributes: ["id", "name", "locale"]
    //         },
    //         {
    //             model: Category,
    //             as: "categories",
    //             required: (Array.isArray(categoryIds) && categoryIds.length > 0) ? true : false,
    //             where: whereCategory,
    //             attributes: ["id", "name"],
    //             through: { attributes: [] }
    //         }
    //     ];

    //     const order = [];
    //     if (title) {
    //         order.push([literal('titleRelevance'), 'DESC']);
    //     }
    //     if (text) {
    //         order.push([literal('textRelevance'), 'DESC']);
    //     }
    //     if (userFullName) {
    //         order.push([literal('userRelevance'), 'DESC']);
    //     }
    //     const sortOptions = {
    //         date_asc: ['createdAt', 'ASC'],
    //         date_desc: ['createdAt', 'DESC'],
    //         title_asc: ['title', 'ASC'],
    //         title_desc: ['title', 'DESC'],
    //     };
    //     if (sort)
    //         order.push(sortOptions[sort]);
    //     else order.push(['createdAt', 'DESC']);

    //     const { count, rows } = await Post.findAndCountAll({
    //         where,
    //         attributes,
    //         include,
    //         limit,
    //         offset,
    //         distinct: true,
    //         order,
    //     });

    //     const totalPages = Math.ceil(count / limit);

    //     return {
    //         pagination: {
    //             totalRecords: count,
    //             totalPages: totalPages,
    //             currentPage: page,
    //         },
    //         posts: rows
    //     };
    // },

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