import { DataTypes, Model, Sequelize } from "sequelize";
import { nanoid } from "nanoid";

export class ExpiringPunishments extends Model {
  public static initialize(sequelize: Sequelize) {
    ExpiringPunishments.init({
      id: { type: DataTypes.STRING, allowNull: false, primaryKey: true, defaultValue: nanoid() },
      guildId: { type: DataTypes.STRING, allowNull: false },
      expires: { type: DataTypes.STRING, allowNull: false, defaultValue: 'False' },
      extraInfo: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} }
    }, { sequelize });
  }
}