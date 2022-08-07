import { colors, GuildConfig, Listener, otherIDs } from "#lib";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { client } from "../../bot.js";

export class GuildCreate extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: client,
      event: 'guildCreate',
    });
  }
  
  public override async execute(guild: Guild) {
    GuildConfig.create({ id: guild.id });

    const parentGuild = await this.client.guilds.fetch(otherIDs.parentGuild);
    const channel = await parentGuild.channels.fetch(otherIDs.guildCreateChannel) as TextChannel;
    const embed = new EmbedBuilder()
      .setColor(colors.success)
      .setTimestamp()
      .setTitle(`Joined ${guild}`)
      .setDescription(`Member count: ${guild.memberCount}`);
    channel.send({ embeds: [embed] });
  }
}