"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.Post, { foreignKey: "post_id" });
      Comment.belongsTo(models.User, { foreignKey: "user_id" });
      Comment.hasMany(models.Comment, { foreignKey: "parent_id"});
    }
  }
  Comment.init(
    {
      post_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
