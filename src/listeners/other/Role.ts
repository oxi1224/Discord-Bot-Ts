import { Listener, logAction } from "#lib";
import { client } from "../../bot.js";

export class MemberListeners extends Listener {
  constructor() {
    super('memberListeners', {
      emitter: client,
      event: 'ready',
      method: 'once'
    });
  }
  
  public override async execute() {
    client.on('guildMemberUpdate', async (oldUser, newUser) => {
      if (oldUser.nickname !== newUser.nickname) {
        logAction(newUser.guild, 'memberNickChange', [
          { name: 'Member', value: `${newUser.user}`, inline: true },
          { name: 'Old nickname', value: `\`\`${oldUser.displayName}\`\``, inline: true },
          { name: 'New nickname', value: `\`\`${newUser.displayName}\`\``, inline: true }
        ]);
      } else {
        oldUser.roles.cache.forEach(role => {
          if (newUser.roles.cache.has(role.id)) return;
          logAction(newUser.guild, 'memberRoleRemove', [
            { name: 'User', value: `${newUser.user}`, inline: true },
            { name: 'Role', value: `${role}`, inline: true }
          ]);
        });
        newUser.roles.cache.forEach(role => {
          if (oldUser.roles.cache.has(role.id)) return;
          logAction(newUser.guild, 'memberRoleAdd', [
            { name: 'User', value: `${newUser.user}`, inline: true },
            { name: 'Role', value: `${role}`, inline: true }
          ]);
        });
      }
    });
  }
}