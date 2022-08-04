import { getSetting, Listener, Modlogs, whsRules } from "#lib";
import { EmbedBuilder, GuildMember } from "discord.js";
import { Op } from "sequelize";
import { client } from "../../bot.js";

export class GuildMemberAdd extends Listener {
  constructor() {
    super('guildMemberAdd', {
      emitter: client,
      event: 'guildMemberAdd',
    });
  }
  
  public override async execute(member: GuildMember) {
    const mutedRole = await getSetting(member.guild.id, 'mutedRole');
    const activeMute = await Modlogs.findOne({
      where: {
        victimId: member.id,
        type: 'mute',
        [Op.or]: [
          { expires: { [Op.gt]: new Date().getTime() } },
          { expires: 'False' }
        ]
      }
    }).catch(() => null);

    if (activeMute) member.roles.add(mutedRole);
    // Special functionality for main server, ignore.
    const rulesEmbed = new EmbedBuilder()
      .setTimestamp()
      .setTitle(`Welcome to ${member.guild}! Please make sure to check out our rules:`)
      .setDescription(whsRules.join('\n').trim());
    if (member.guild.id === '508779434929815554') member.send({ embeds: [rulesEmbed] }).catch(() => null);
  }
}