const db = require("models");
const { Op } = require("sequelize");
const { Category } = db;

const categoryService = {
  getCategoriesCursor: async (query) => {
    const limit = parseInt(query.limit) || 4; // Default load 3 categories at a time
    const cursor = parseInt(query.cursor) || 0; // Last Category ID seen

    const where = {
      status: '1' // Only Active categories
    };

    // CURSOR LOGIC: Get IDs greater than the cursor
    if (cursor > 0) {
      where.id = { [Op.gt]: cursor };
    }

    const categories = await Category.findAll({
      where,
      limit: limit + 1, // Fetch 1 extra to check if there's more
      order: [['id', 'ASC']], // Deterministic sort is required for cursors
      attributes: ['id', 'name']
    });

    let nextCursor = null;

    // Check if we have more
    if (categories.length > limit) {
      const nextItem = categories.pop(); // Remove the extra item
      // The ID of the last item in the *remaining* list is the next cursor
      nextCursor = categories[categories.length - 1].id;
    }

    return {

      categories,
      meta: {
        nextCursor,
        hasMore: nextCursor !== null
      }

    };
  },
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
      order: [["createdAt", "ASC"]],
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
    if (data.name) {
      const existingCategory = await Category.findOne({
        where: { name: data.name, id: { [Op.ne]: id } },
      });
      if (existingCategory) {
        throw new Error("Category name must be unique");
      }
    }
    return await category.update(data);
  },
};

module.exports = categoryService;
