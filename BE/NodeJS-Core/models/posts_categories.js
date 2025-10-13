"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Posts_Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Posts_Categories.belongsTo(models.Posts, { foreignKey: "post_id" });
      Posts_Categories.belongsTo(models.Categories, {
        foreignKey: "category_id",
      });
    }
  }
  Posts_Categories.init(
    {
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Posts",
          key: "id",
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Posts_Categories",
    }
  );
  return Posts_Categories;
};
