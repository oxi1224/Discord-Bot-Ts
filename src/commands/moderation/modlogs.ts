import { TimeInMs } from '#base';
import { Message, User, EmbedBuilder, CommandInteraction, EmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentEmojiResolvable } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, logError, colors, Modlogs, emotes } from '#lib';
import { Op } from "sequelize";

export default class ModlogsCommand extends Command {
  constructor() {
    super('modlogs', {
      aliases: ['modlogs', 'punishments'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user whose modlogs to display'
        }
      ],
      description: 'Displays modlogs of a user',
      usage: 'modlogs <user>',
      examples: ['mute @oxi#6219 spamming', 'mute @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.ModerateMembers
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    
    const embedArray: EmbedBuilder[] = [];

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('modlogs-first')
          .setEmoji(emotes.first as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('modlogs-back')
          .setEmoji(emotes.back as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('modlogs-delete')
          .setEmoji(emotes.stop as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('modlogs-next')
          .setEmoji(emotes.next as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('modlogs-last')
          .setEmoji(emotes.last as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Primary),
      );

    let punishments: Modlogs[] | undefined;
    try {
      punishments = await Modlogs.findAll({
        where: {
          [Op.and]: [
            { guildId: message.guild.id },
            { victimId: args.user.id }
          ]          
        },
        order: [['timestamp', 'ASC']]
      });
    } catch (e) {
      await message.reply('There was an error while fetching the punishments. Pleae contact oxi#6219');
      await logError(e as Error);
    }

    if (punishments?.length === 0) return message.reply(embeds.info(`${args.user} has no modlogs`));
    let fields: EmbedField[] = [];
    punishments?.forEach(p => {
      fields.push({
        name: `Type: ${p.type}`,
        value: `
Reason: \`\`${p.reason}\`\`
Moderator: <@${p.moderatorId}>
Punishment Time: <t:${Math.floor(parseInt(p.timestamp) / 1000)}>
Duration: ${p.duration}
Expires: ${p.expires ? `<t:${Math.floor(p.expires / 1000)}>` : 'False'}
Modlog ID: ${p.id}
${p.extraInfo ?? ''}
        `.trim(), inline: false });
      if (fields.length === 4) {
        embedArray.push(new EmbedBuilder()
          .setTimestamp()
          .setColor(colors.base)
          .setTitle(`${args.user.username}'s modlogs`)
          .setFields(fields));
        fields = [];
      }
    });
    embedArray.push(new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`${args.user.username}'s modlogs`)
      .setFields(fields));
    
    let page = 0;
    embedArray[0].setFooter({ 'text': `Page ${page + 1}/${embedArray.length}` });
    const msg = await message.reply({ embeds: [embedArray[0]], components: [buttons] });
    const collector = msg.createMessageComponentCollector({ 'time': TimeInMs.Second * 60 });
    collector.on('collect', async (i) => {
      if (!i.isButton()) return;
      switch (i.customId) {
      case 'modlogs-back':
        if (page === 0) { i.deferUpdate(); return; }
        page--;
        break;
      case 'modlogs-next':
        if (page === embedArray.length - 1) { i.deferUpdate(); return; }
        page++;
        break;
      case 'modlogs-first':
        page = 0;
        break;
      case 'modlogs-last':
        page = embedArray.length - 1;
        break;
      case 'modlogs-delete':
        if (msg instanceof Message) msg.delete();
        if (msg instanceof CommandInteraction) msg.deleteReply();
        collector.stop();
        break;
      }
      i.update({
        embeds: [embedArray[page].setFooter({ 'text': `Page ${page + 1}/${embedArray.length}` })],
        components: [buttons]
      });
    });
    return;
  }
}