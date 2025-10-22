"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
      User.hasMany(models.Post, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      full_name: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING },
      url_avatar: { type: DataTypes.STRING },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Roles", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("1", "0"),
        allowNull: false,
        defaultValue: "1",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
