const languageService = require("modules/languages/services/languageService.js");
const responseUtils = require("utils/responseUtils");

const languageController = {
    getAllLanguages: async (req, res) => {
        try {
            const languages = await languageService.getAllLanguages();
            responseUtils.ok(res, languages);
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
    getLanguageById: async (req, res) => {
        try {
            const languageId = req.params.languageId;
            const language = await languageService.getLanguageById(languageId);
            if (!language) {
                return responseUtils.notFound(res);
            }
            responseUtils.ok(res, language);
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
    createLanguage: async (req, res) => {
        try {
            const data = req.body;
            const newLanguage = await languageService.createLanguage(data);
            res.status(201).json(newLanguage);
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
    updateLanguage: async (req, res) => {
        try {
            const languageId = req.params.languageId;
            const data = req.body;
            const updatedLanguage = await languageService.updateLanguage(languageId, data);
            responseUtils.ok(res, updatedLanguage);
        } catch (error) {
            if (error.message === "Language not found") {
                return responseUtils.notFound(res);
            }
            responseUtils.error(res, error.message);
        }
    },
    toggleLanguageStatus: async (req, res) => {
        try {
            const { languageId } = req.params;
            const updatedLanguage = await languageService.toggleLanguageStatus(languageId);
            if (!updatedLanguage) return responseUtils.notFound(res, "Language not found");

            responseUtils.ok(res, {
                message: `Language status updated to ${updatedLanguage.status}`,
                data: updatedLanguage,
            });
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
}

module.exports = languageController;