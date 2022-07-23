import { DataTypes, Model, Sequelize } from "sequelize";
import { nanoid } from "nanoid";
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
   * Reason of the punishment. Defaults to 'None'
   */
  declare reason: string;

  /**
   * Expiration timestamp of the punishment. Expires to 'False'
   */
  declare expires: number;

  public static initialize(sequelize: Sequelize) {
    Modlogs.init({
      guildId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      id: { type: DataTypes.STRING, allowNull: false, defaultValue: nanoid() },
      victimId: { type: DataTypes.STRING, allowNull: false },
      moderatorId: { type: DataTypes.STRING, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: 'None' },
      expires: { type: DataTypes.STRING, allowNull: true, defaultValue: 'False' },
    }, { sequelize });
  }
}