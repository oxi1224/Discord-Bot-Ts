import { DataTypes, Model, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";

export class ExpiringPunishments extends Model {

  /**
   * Id of the victim.
   */
  declare victimId: Snowflake;

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
      victimId: { type: DataTypes.STRING, allowNull: false, primaryKey: true, unique: false },
      guildId: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      expires: { type: DataTypes.STRING, allowNull: true },
      extraInfo: { type: DataTypes.STRING, allowNull: true }
    }, { sequelize });
  }
}

export interface ExpiringPunishmentInfo {
  victimId: Snowflake,
  guildId: Snowflake,
  type: string,
  expires: number,
  extraInfo?: Snowflake
}