const db = require("models");
const { Op } = require("sequelize");
const { Language } = db;
const languageValidation = require("modules/languages/validations/languageValidation.js");

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

        const { count, rows } = await Language.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return {
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    },
    getLanguageById: async (id) => {
        return await Language.findByPk(id);
    },
    createLanguage: async (data) => {
        const { error } = languageValidation.createLanguage(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        const existingLanguage = await Language.findOne({ where: { name: data.name } });
        if (existingLanguage) {
            throw new Error("Language with this name already exists");
        }
        return await Language.create(data);
    },
    updateLanguage: async (id, data) => {
        const { error } = languageValidation.updateLanguage(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        const language = await Language.findByPk(id);
        if (!language) {
            throw new Error("Language not found");
        }
        const existingLanguage = await Language.findOne({
            where: { name: data.name, id: { [Op.ne]: id } },
        });
        if (existingLanguage) {
            throw new Error("Language name must be unique");
        }
        return await language.update(data);
    },
    toggleLanguageStatus: async (languageId) => {
        const language = await Language.findByPk(languageId);
        if (!language) return null;

        language.status = language.status === "1" ? "0" : "1";
        await language.save();
        return language;
    },
};

module.exports = languageService;