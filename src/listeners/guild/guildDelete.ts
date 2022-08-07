import { colors, GuildConfig, Listener, otherIDs } from "#lib";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { client } from "../../bot.js";

export class GuildDelete extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: client,
      event: 'guildDelete',
    });
  }
  
  public override async execute(guild: Guild) {
    const row = await GuildConfig.findByPk(guild.id);
    row?.destroy();

    const parentGuild = await this.client.guilds.fetch(otherIDs.parentGuild);
    const channel = await parentGuild.channels.fetch(otherIDs.guildDeleteChannel) as TextChannel;
    const embed = new EmbedBuilder()
      .setColor(colors.error)
      .setTimestamp()
      .setTitle(`Left ${guild}`)
      .setDescription(`Member count: ${guild.memberCount}`);
    channel.send({ embeds: [embed] });
  }
}