import { Listener, logAction } from "#lib";
import { GuildChannel } from "discord.js";
import { client } from "../../bot.js";

export class ChannelListeners extends Listener {
  constructor() {
    super('channelListeners', {
      emitter: client,
      event: 'ready',
      method: 'once'
    });
  }
  
  public override async execute() {
    for (const type of ['channelCreate', 'channelDelete']) {
      client.on(type, async (channel: GuildChannel) => {
        const guild = channel.guild;
        await logAction(guild, type, [{ name: 'Channel', value: `${channel}`, inline: false }]);
      });
    }
  }
}