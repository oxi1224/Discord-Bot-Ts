import { createModlogsEntry, getSetting, Listener, logError, ModlogUtilOptions, sendModlog, URLRegex } from "#lib";
import { GuildMember, Message } from "discord.js";
import { client } from "../../bot.js";
import { default as scamLinks } from './badLinks.js';

export class ScamLink extends Listener {
  constructor() {
    super('scamLink', {
      emitter: client,
      event: 'messageCreate',
    });
  }
  
  public override async execute(message: Message) {
    if (!message.guild?.available) return;
    if (!message.content.match(URLRegex)) return;
    if (!scamLinks.some(link => message.content.includes(link))) return;
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const mutedRole = await getSetting(message.guild.id, 'mutedRole');
    const options: ModlogUtilOptions = {
      moderatorId: (await message.guild.members.fetchMe()).id,
      victimId: author.id,
      type: 'mute',
      reason: 'Sending a scam link',
      duration: 'Permanent'
    };
    message.delete();
    if (!mutedRole) return;
    let entry;
    try {
      entry = await createModlogsEntry(message.guild, options);
    } catch (e) {return logError(e as Error);}
    try {
      await author.roles.add(mutedRole);
      await sendModlog(message.guild, Object.assign(options, { id: entry.id }));
    } catch (e) {
      logError(e as Error);
      await entry.destroy();
    }
    return;
  }
}