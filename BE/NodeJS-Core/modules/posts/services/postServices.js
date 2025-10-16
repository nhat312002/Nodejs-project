const db = require("models");
const {Post} = db;
const {Op} = db.Sequelize;

const postServices = {
    getPosts: async () => {
        return await Post.findAll({
            where: {
                status: {
                    [Op.not]: 'disabled'
                }
            }
        }
        );
    },

    getPostsByLanguage: async (languageId) => {
        return await Post.findAll({
            where: {
                status: {
                    [Op.not]: 'disabled'
                },
                language_id: languageId
            }
        })
    },

    getPostsByLanguageAndCategories: async (languageId, categoryIds) => {
        return await Post.findAll({
            where: {
                status: {
                    [Op.not]: 'disabled'
                },
                language_id: languageId
            },
            include: [
                {
                    model: Category,
                    where: {
                        id: {
                            [Op.in]: categoryIds
                        }
                    },
                    through: { attributes: [] }
                }
            ]
        });
    },

    createPost: async ({ title, body, userId, languageId, categoryIds }) => {
        const post = await Post.create({
            title: title,
            body: body,
            user_id: userId,
            language_id: languageId
        });
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            await post.setCategories(categoryIds);
        }
        return post;
    },

    updatePost: async (id, { title, body, categoryIds }) => {
        const post = await Post.findByPk(id);
        if (!post) {
            return null;
        }

        if (title !== undefined) post.title = title;
        if (body !== undefined) post.body = body;
        await post.save();

        if (Array.isArray(categoryIds)) {
            await post.setCategories(categoryIds);
        }

        return post;
    },

    disablePost: async (id) => {
        const post = await Post.findByPk(id);
        if (!post) {
            return null;
        }
        post.status = 'disabled';
        await post.save();
        return post;
    }
};

module.exports = postServices;