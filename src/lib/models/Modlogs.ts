import { DataTypes, Model, Sequelize } from "sequelize";
import { nanoid } from "nanoid";

export class Modlogs extends Model {
  public static initialize(sequelize: Sequelize) {
    Modlogs.init({
      id: { type: DataTypes.STRING, allowNull: false, primaryKey: true, defaultValue: nanoid() },
      guildId: { type: DataTypes.STRING, allowNull: false },
      victimId: { type: DataTypes.STRING, allowNull: false },
      moderatorId: { type: DataTypes.STRING, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: 'None' },
      expires: { type: DataTypes.STRING, allowNull: true, defaultValue: 'False' },
    }, { sequelize });
  }
}