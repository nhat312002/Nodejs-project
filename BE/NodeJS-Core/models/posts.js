"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Posts.belongsTo(models.Users, { foreignKey: "user_id" });
      Posts.belongsTo(models.Languages, { foreignKey: "language_id" });
      Posts.belongsTo(models.Posts, {
        foreignKey: "original_id",
        as: "originalPost",
      });
      Posts.hasMany(models.Posts, {
        foreignKey: "original_id",
        as: "translations",
      }); // Self-referential association for translations
    }
  }
  Posts.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.STRING, allowNull: false },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      original_id: {
        type: DataTypes.INTEGER,
        references: { model: "Posts", key: "id" },
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Languages", key: "id" },
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
      modelName: "Posts",
    }
  );
  return Posts;
};
