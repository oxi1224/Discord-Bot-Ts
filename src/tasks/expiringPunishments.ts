import { colors, ExpiringPunishments, Task, sendModlog, createModlogsEntry, PunishmentType, getConfig } from "#lib";
import { TimeInMs } from "#base";
import { Op } from "sequelize";
import { EmbedBuilder } from "discord.js";

export default class RemoveExpiringPunishments extends Task {
  constructor() {
    super('expiringPunishments', {
      interval: TimeInMs.Second * 30
    });
  }

  public override async execute() {
    const punishmentsToRemove = await ExpiringPunishments.findAll({
      where: {
        expires: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [Op.lt]: (new Date().getTime() + this.interval!).toString()
        } 
      }
    }).catch(() => null);

    if (!punishmentsToRemove) return;
    punishmentsToRemove.forEach(async punishment => {
      const guild = await this.client.guilds.fetch(punishment.guildId);
      const config = await getConfig(punishment.guildId);
      const botMember = await guild.members.fetchMe();
      const victim = await this.client.users.fetch(punishment.victimId);
      const victimMember = await guild.members.fetch(victim).catch(() => null);
      const embed = new EmbedBuilder()
        .setTimestamp()
        .setColor(colors.base)
        .setTitle(`You've been un${punishment.type}ed in ${guild}`)
        .setDescription("Reason: ```Time's up!```");
      const entry = await createModlogsEntry(guild, {
        moderatorId: botMember.id,
        victimId: punishment.victimId,
        type: `un${punishment.type}` as PunishmentType,
        reason: "Time's up!",
      });

      switch (punishment.type) {
      case 'ban':
        const banList = await guild.bans.fetch();
        if (!banList.has(punishment.victimId)) return;
        await guild.bans.remove(punishment.victimId).catch(() => null);
        break;
      case 'mute':
        if (!victimMember) return;
        if (!victimMember.roles.cache.has(config.mutedRole)) return;
        await victimMember.roles.remove(config.mutedRole);
        break;
      }
      await sendModlog(guild, {
        id: entry.id,
        moderatorId: botMember.id,
        victimId: punishment.victimId,
        type: `un${punishment.type}` as PunishmentType,
        reason: "``Time's up!```"
      });
      await victim.send({ embeds: [embed] }).catch(() => null);
      await punishment.destroy();
    });
  }
}