import { Command } from '#base';
import { Message, CommandInteraction, User } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";
export default class WarnCommand extends Command {
    constructor() {
        super('warn', {
            aliases: ['warn'],
            args: [
                {
                    id: 'user',
                    type: 'user',
                    optional: false,
                    slashType: ApplicationCommandOptionType.User,
                    description: 'The user to warn'
                },
                {
                    id: 'reason',
                    type: 'string',
                    slashType: ApplicationCommandOptionType.String,
                    description: 'The user to warn'
                },
                {
                    id: 'flag',
                    type: 'flag',
                    slashType: ApplicationCommandOptionType.Boolean,
                    description: 'test flag'
                }
            ],
            description: 'Warns a member'
        });
    }
    execute(message, args) {
        console.log(args);
    }
}
//# sourceMappingURL=warn.js.map