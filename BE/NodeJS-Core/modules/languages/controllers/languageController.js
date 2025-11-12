const languageService = require("modules/languages/services/languageService.js");
const responseUtils = require("utils/responseUtils");
const languageValidation = require("modules/languages/validations/languageValidation")
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "uploads/flags");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
        const ext = file.mimetype.toLowerCase();
        if (allowedTypes.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type"));
    },
});

const languageController = {
    getActiveLanguages: async (req, res) => {
        try {
            const { error, value } = languageValidation.getAllLanguages(req.query);
            if (error) return responseUtils.error(res, error.details[0].message);
            
            const merge = Object.assign({}, req.query, {status: "1"});
            console.log(merge);
            const languages = await languageService.getAllLanguages(merge);
            responseUtils.ok(res, languages);
            
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },

    getAllLanguages: async (req, res) => {
        try {
            const { error, value } = languageValidation.getAllLanguages(req.query);
            if (error) return responseUtils.error(res, error.details[0].message);

            const languages = await languageService.getAllLanguages(req.query);
            responseUtils.ok(res, languages);
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
    getLanguageById: async (req, res) => {
        try {
            const { error, value } = languageValidation.getLanguageById(req.params);
            if (error) return responseUtils.error(res, error.details[0].message);

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
    createLanguage: [
        upload.single("url_flag"),
        async (req, res) => {
            try {
                const { locale, name, status } = req.body;
                const url_flag = req.file ? `/uploads/flags/${req.file.filename}` : null;
                const data = { locale, name, status, url_flag };
                const newLanguage = await languageService.createLanguage(data);
                res.status(201).json(newLanguage);
            } catch (error) {
                responseUtils.error(res, error.message);
            }
        },
    ],
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

            responseUtils.ok(res,
                updatedLanguage,
                `Language status updated to ${updatedLanguage.status}`
            );
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
}

module.exports = languageController;