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
      Post.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Post.belongsTo(models.Language, { foreignKey: "language_id", as: "language" });
      Post.belongsTo(models.Post, {
        foreignKey: "original_id",
        as: "originalPost",
      });
      Post.belongsToMany(models.Category, {
        through: models.Post_Category,
        as: "categories",
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
      body: { type: DataTypes.TEXT('long'), allowNull: false },
      // body_text: {type: DataTypes.TEXT('long'), allowNull: false},
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
        values: ["1", "2", "3", "0"],
        allowNull: false,
        defaultValue: "1",
      },
    },
    {
      sequelize,
      modelName: "Post",
      indexes: [
        {
          name: 'posts_fulltext_index',
          type: 'FULLTEXT',
          fields: ['title'],
        },
        {
          name: 'posts_title_body_fulltext_index',
          type: 'FULLTEXT',
          fields: ['title'],
        },
      ],
    }
  );
  return Post;
};
