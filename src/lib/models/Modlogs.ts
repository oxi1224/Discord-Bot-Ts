import { DataTypes, Model, Sequelize } from "sequelize";
import { Snowflake } from "discord.js";

export class Modlogs extends Model {
  /**
   * Id of the guild this modlog was created in.
   */
  declare guildId: Snowflake;

  /**
   * Unique id of the modlog.
   */
  declare id: string;

  /**
   * Id of the victim.
   */
  declare victimId: Snowflake;

  /**
   * Id of the moderator.
   */
  declare moderatorId: Snowflake;

  /**
   * Type of the punishment.
   */
  declare type: PunishmentType;

  /**
   * Reason of the punishment. Defaults to 'None'
   */
  declare reason: string;

  /**
   * Expiration timestamp of the punishment. Defaults to 'False'
   */
  declare expires: number;

  /**
   * String value of the duration of the punishment. (e.g 2days)
   */
  declare duration: string;

  /**
   * The timestamp of when the punishment was performed.
   */
  declare timestamp: string;

  /**
   * Extra info about the punishment.
   */
  declare extraInfo: Snowflake;

  public static initialize(sequelize: Sequelize) {
    Modlogs.init({
      id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      guildId: { type: DataTypes.STRING, allowNull: false, unique: false },
      victimId: { type: DataTypes.STRING, allowNull: false },
      moderatorId: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: 'None' },
      expires: { type: DataTypes.BIGINT, allowNull: true },
      duration: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Permanent' },
      timestamp: { type: DataTypes.BIGINT, allowNull: true, defaultValue: new Date().getTime() },
      extraInfo: { type: DataTypes.STRING, allowNull: true }
    }, { sequelize });
  }
}

export type PunishmentType = 'ban' | 'unban' | 'block' | 'unblock' | 'mute' | 'unmute' | 'timeout' | 'untimeout' | 'warn' | 'kick'
export interface PunishmentInfo {
  guildId: Snowflake,
  id: string,
  victimId: Snowflake,
  moderatorId: Snowflake,
  type: PunishmentType,
  reason?: string,
  expires?: number | null,
  duration?: string | null,
  extraInfo?: string
}