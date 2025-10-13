"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comments.belongsTo(models.Posts, { foreignKey: "post_id" });
      Comments.belongsTo(models.Users, { foreignKey: "user_id" });
      Comments.hasMany(models.Comments, { foreignKey: "parent_id" });
    }
  }
  Comments.init(
    {
      post_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
      content: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Comments",
    }
  );
  return Comments;
};
