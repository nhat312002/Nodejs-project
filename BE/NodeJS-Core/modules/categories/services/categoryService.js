const db = require("models");
const { Op } = require("sequelize");
const { Category } = db;
const categoryValidation = require("modules/category/validations/categoryValidation");

const categoryService = {
    getAllCategories: async () => {
        return await Category.findAll();
    },
    getCategoryById: async (id) => {
        return await Category.findByPk(id);
    },
    createCategory: async (data) => {
        const { error } = categoryValidation.createCategory(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        const existingCategory = await Category.findOne({ where: { name: data.name } });
        if (existingCategory) {
            throw new Error("Category with this name already exists");
        }
        return await Category.create(data);
    },
    updateCategory: async (id, data) => {
        const { error } = categoryValidation.updateCategory(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error("Category not found");
        }
        const existingCategory = await Category.findOne({
            where: { name: data.name, id: { [Op.ne]: id } },
        });
        if (existingCategory) {
            throw new Error("Category name must be unique");
        }
        return await category.update(data);
    },
    toggleCategoryStatus: async (id) => {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Category not found");

    category.status = category.status === "active" ? "disabled" : "active";
    await category.save();
    return category;
},

};

module.exports = categoryService;