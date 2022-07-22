import { DataTypes, Model, Sequelize } from "sequelize";

export class GuildConfig extends Model {
  public static initialize(sequelize: Sequelize) {
    GuildConfig.init({
      id: { type: DataTypes.STRING, primaryKey: true },
      mutedRole: { type: DataTypes.STRING, allowNull: false },
      prefix: { type: DataTypes.STRING, defaultValue: '!' },
      commandChannels: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      automodImmune: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      lockdownChannels: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
      loggingChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
    }, { sequelize });
  }
}