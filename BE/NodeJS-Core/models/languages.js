"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Languages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Languages.hasMany(models.Posts, { foreignKey: "language_id" });
    }
  }
  Languages.init(
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
      modelName: "Languages",
    }
  );
  return Languages;
};
