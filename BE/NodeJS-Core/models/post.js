"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, { foreignKey: "user_id" });
      Post.belongsTo(models.Language, { foreignKey: "language_id" });
      Post.belongsTo(models.Post, {
        foreignKey: "original_id",
        as: "originalPost",
      });
      Post.belongsToMany(models.Category, {
        through: models.Post_Category,
        foreignKey: "post_id",
        otherKey: "category_id",
      });
      Post.hasMany(models.Post, {
        foreignKey: "original_id",
        as: "translations",
      }); // Self-referential association for translations
    }
  }
  Post.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.STRING, allowNull: false },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "User", key: "id" },
      },
      original_id: {
        type: DataTypes.INTEGER,
        references: { model: "Post", key: "id" },
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Language", key: "id" },
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "approved", "rejected", "deleted"],
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
