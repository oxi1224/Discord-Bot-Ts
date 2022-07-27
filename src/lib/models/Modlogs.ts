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
  declare expires: number | null;

  /**
   * String value of the duration of the punishment. (e.g 2days)
   */
  declare duration: string | null;

  public static initialize(sequelize: Sequelize) {
    Modlogs.init({
      guildId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      id: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
      victimId: { type: DataTypes.STRING, allowNull: false },
      moderatorId: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: 'None' },
      expires: { type: DataTypes.STRING, allowNull: true, defaultValue: 'False' },
      duration: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Permanent' }
    }, { sequelize });
  }
}

export type PunishmentType = 'ban' | 'unban' | 'block' | 'unblock' | 'mute' | 'unmute' | 'timeout' | 'untimeout' | 'warn'
export type PunishmentInfo = {
  guildId: Snowflake,
  id: string,
  victimId: Snowflake,
  moderatorId: Snowflake,
  type: PunishmentType,
  reason?: string,
  expires?: number | null,
  duration?: string | null,
}