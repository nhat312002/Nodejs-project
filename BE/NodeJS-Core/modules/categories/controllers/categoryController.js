const category = require("models/category");
const categoryService = require("modules/categories/services/categoryService.js");
const { getApiName } = require("utils/apiUtils");
const { error } = require("utils/responseUtils");
const responseUtils = require("utils/responseUtils")
const categoryValidation = require("modules/categories/validations/categoryValidation");

const categoryController = {
    getActiveCategoriesCursor: async (req, res) => {
        try {
            const results = await categoryService.getCategoriesCursor(req.query);
            return responseUtils.ok(res, results);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    getActiveCategories: async (req, res) => {
        try {
            const merge = Object.assign({}, req.query, {status: '1'});
            const categories = await categoryService.getAllCategories(merge);
            return responseUtils.ok(res, categories);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllCategories: async (req, res) => {
        try {
            const categories = await categoryService.getAllCategories(req.query);
            return responseUtils.ok(res, categories);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    getCategoryById: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const category = await categoryService.getCategoryById(categoryId);
            if (!category) {
                return responseUtils.error(res, error.message);
            }
            responseUtils.ok(res, category);
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    createCategory: async (req, res) => {
        try {
            const data = req.body;
            const newCategory = await categoryService.createCategory(data);
            res.status(201).json(newCategory);
        } catch (error) {
            responseUtils.error(res, error.message);
        }
    },
    updateCategory: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const data = req.body;
            const updateCategory = await categoryService.updateCategory(categoryId, data);
            responseUtils.ok(res, updateCategory);
        } catch (error) {
            if (error.message === "Category not found") {
                return responseUtils.notFound(res);
            }
            responseUtils.error(res, error.message);
        }
    },
    toggleCategoryStatus: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const updated = await categoryService.toggleCategoryStatus(categoryId);
            responseUtils.ok(res, updated);
        } catch (error) {
            if (error.message === "Category not found")
                return responseUtils.notFound(res, "Category not found");
            responseUtils.error(res, error.message);
        }
    },
};

module.exports = categoryController;