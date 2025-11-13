const db = require("models");
const { Op } = require("sequelize");
const { Category } = db;
const categoryValidation = require("modules/categories/validations/categoryValidation");

const categoryService = {
  getAllCategories: async (query) => {
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

    const { count, rows } = await Category.findAndCountAll({
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
      categories: rows,
    };
  },
  getCategoryById: async (id) => {
    return await Category.findByPk(id);
  },
  createCategory: async (data) => {
    const existingCategory = await Category.findOne({
      where: { name: data.name },
    });
    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
    return await Category.create(data);
  },
  updateCategory: async (id, data) => {
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

    category.status = category.status === "1" ? "0" : "1";
    await category.save();
    return category;
  },
};

module.exports = categoryService;
