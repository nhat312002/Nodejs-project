const db = require("models");
const { Op } = require("sequelize");
const { Language } = db;
const languageValidation = require("modules/language/validations/languageValidation.js");
const { getAllLanguages } = require("../controllers/languageController");

const languageService = {
    getAllLanguages: async () => {
        return await Language.findAll();
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

        language.status = language.status === "active" ? "disabled" : "active";
        await language.save();
        return language;
    },
};

module.exports = languageService;