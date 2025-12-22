const db = require("models");
const { Op } = require("sequelize");
const { Language } = db;

const languageService = {
    getAllLanguages: async (query) => {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;
        const where = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.name) {
            where.name = { [Op.like]: `%${query.name}%` };
        }

        if (query.locale) {
            where.locale = { [Op.like]: `%${query.locale}%` };
        }

        const { count, rows } = await Language.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return {
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            },
            languages: rows,
        };
    },
    getLanguageById: async (id) => {
        return await Language.findByPk(id);
    },
    createLanguage: async (data) => {
        console.log("Get into services");
        const existingLanguage = await Language.findOne(
            {
                where: {
                    [Op.or]: {
                        name: data.name,
                        locale: data.locale,
                    }
                }
            });
        // console.log(existingLanguage);
        if (existingLanguage){
            if (existingLanguage.name == data.name) {
                console.log("Name exists");
                throw new Error("Language with this name already exists");
            }
            if (existingLanguage.locale == data.locale) {
                console.log("Locale exists");
                throw new Error("Language with this locale already exists");
            }
        }
        return await Language.create(data);
    },
    updateLanguage: async (id, data) => {
        const language = await Language.findByPk(id);
        if (!language) {
            throw new Error("Language not found");
        }
        const uniquenessConditions = [];
        if (data.name)
            uniquenessConditions.push({ name: data.name });
        if (data.locale)
            uniquenessConditions.push({ locale: data.locale });

        const existingLanguage = await Language.findOne({
            where: {
                [Op.or]: uniquenessConditions,
                id: { [Op.ne]: id }
            }
        });

        if (existingLanguage) {
            if (data.name == existingLanguage.name)
                throw new Error("Language name must be unique");
            if (data.locale == existingLanguage.locale)
                throw new Error("Locale must be unique");
        }
        return await language.update(data);
    },
};

module.exports = languageService;