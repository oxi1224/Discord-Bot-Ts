import { DataTypes, Model, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";

export class ExpiringPunishments extends Model {

  /**
   * Id of the victim.
   */
  declare id: Snowflake;

  /**
   * Id of the guild the punishment happened in.
   */
  declare guildId: Snowflake;

  /**
   * Type of the punishment.
   */
  declare type: string;

  /**
   * Timestamp of when the punishment expires.
   */
  declare expires: number;

  /**
   * Extra info for the punishment, e.g the channel for block.
   */
  declare extraInfo: Snowflake;

  public static initialize(sequelize: Sequelize) {
    ExpiringPunishments.init({
      id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      expires: { type: DataTypes.NUMBER, allowNull: false, defaultValue: 'False' },
      extraInfo: { type: DataTypes.STRING, allowNull: true }
    }, { sequelize });
  }
}