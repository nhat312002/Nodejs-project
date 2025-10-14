"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Language.hasMany(models.Post, { foreignKey: "language_id" });
    }
  }
  Language.init(
    {
      locale: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      url_flag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "disabled"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Language",
    }
  );
  return Language;
};
