import { TimeInMs } from "#base";
import { createExpiringPunishmentsEntry, createModlogsEntry, getSetting, Listener, logError, ModlogUtilOptions, sendModlog } from "#lib";
import { Collection, GuildMember, GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { client } from "../../bot.js";

export class Spam extends Listener {
  private guildCollection: Collection<Snowflake, Map<Snowflake, UserMapValue>>;

  constructor() {
    super('spam', {
      emitter: client,
      event: 'messageCreate',
    });
    this.guildCollection = new Collection();
  }
  
  public override async execute(message: Message) {
    if (!message.guild?.available) return;
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const automodImmune = await getSetting(message.guild.id, 'automodImmune');
    if (automodImmune.includes(author.id)) return;
    if (!this.guildCollection.has(message.guild.id)) this.guildCollection.set(message.guild.id, new Map());
    const usersMap = this.guildCollection.get(message.guild.id);
    if (!usersMap) return;
    if (!usersMap.has(author.id)) {
      usersMap.set(author.id, {
        messageCount: 1,
        lastMessage : message,
        timer : setTimeout(() => {
          usersMap.delete(author.id);
        }, 5000)
      });
      return;
    }
    const userData = usersMap.get(author.id);
    if (!userData) return;
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let messageCount = userData.messageCount;
    if (messageCount === 7) return;

    if (difference > 5000) {
      clearTimeout(timer);
      userData.messageCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(author.id);
      }, 5000);
      usersMap.set(author.id, userData);
    } else {
      ++messageCount;
      messageCount === 7 ? await this.punishSpam(author, message) : (() => {
        userData.messageCount = messageCount;
        usersMap.set(author.id, userData);
      })();
    }
    return;
  }

  private async punishSpam(member: GuildMember, message: Message) {
    if (!message.guild?.available) return;
    const mutedRole = await getSetting(message.guild.id, 'mutedRole');
    if (!mutedRole) return;
    const options: ModlogUtilOptions = {
      moderatorId: (await message.guild.members.fetchMe()).id,
      victimId: member.id,
      type: 'mute',
      reason: 'Spamming',
      duration: '15min',
      expires: new Date().getTime() + (TimeInMs.Minute * 15) // 15 minutes from now
    };
    let i = 0;
    const messages = (await message.channel.messages.fetch({ limit: 100 }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((msg): any => {
        if (i < 7 && msg.author.id === member.id) {i++; return msg as Message<boolean>;}
        return;
      });

    let modlogsEntry, expiringPunishmentsEntry;
    if (!member.roles.cache.has(mutedRole)) {
      try {
        modlogsEntry = await createModlogsEntry(message.guild, options);
        expiringPunishmentsEntry = await createExpiringPunishmentsEntry(message.guild, {
          'expires': options.expires as number,
          'type': 'mute',
          'victimId': member.id
        });
      } catch (e) {return logError(e as Error);}
      try {
        await member.roles.add(mutedRole);
        await sendModlog(message.guild, Object.assign(options, { id: modlogsEntry.id }));
      } catch (e) {
        logError(e as Error);
        await expiringPunishmentsEntry.destroy();
        await modlogsEntry.destroy();
      }
      (message.channel as GuildTextBasedChannel).bulkDelete(messages);
      message.channel.send('Please refrain from spamming');
    }

  }
}

interface UserMapValue {
  messageCount: number,
  lastMessage: Message,
  timer: ReturnType<typeof setTimeout>
}