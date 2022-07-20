import { PermissionFlagsBits } from "discord-api-types/v10";
import { CommandInteraction } from "discord.js";
import { Argument } from "./Argument.js";
import { regex } from "../lib/constants.js";
import { parseDuration } from "../lib/util/parseDuration.js";
import { CommandHandler } from "./CommandHandler.js";
import { CustomClient } from "../CustomClient.js";
export class BaseCommand {
    id;
    constructor(id) {
        this.id = id;
    }
}
export class Command {
    id;
    aliases;
    args;
    userPermissions;
    description;
    slash;
    argumentArray;
    flagCount;
    client;
    commandHandler;
    constructor(id, { aliases, args = [], userPermissions = PermissionFlagsBits.SendMessages, description = '', slash = true, }) {
        this.id = id;
        this.aliases = aliases;
        this.args = args;
        this.userPermissions = userPermissions;
        this.description = description;
        this.slash = slash;
        this.argumentArray = this.initArgs(args);
        this.flagCount = (this.argumentArray.filter(arg => arg.type === 'flag')).length;
    }
    execute(message, args) {
        throw new Error(`Execute function empty in ${this.id} command.`);
    }
    executeSlash(interaction, args) {
        this.execute(interaction, args);
    }
    initArgs(args) {
        const argArray = [];
        args.forEach(arg => {
            argArray.push(new Argument(this, arg));
        });
        return argArray;
    }
    async parseArgs(message, argumentArray) {
        if (message instanceof CommandInteraction)
            return this.parseSlash(message, argumentArray);
        const contentArray = message.content.split(' ');
        contentArray.shift();
        if (!contentArray)
            return null;
        const args = {};
        for (let i = 0; i < argumentArray.length; i++) {
            const arg = argumentArray[i];
            if (arg.type !== 'string' && arg.length !== Infinity)
                throw new Error('The length property may only appear with string type');
            let value;
            if (contentArray[arg.index]) {
                switch (arg.type) {
                    case 'user':
                        if (!contentArray[arg.index].match(regex.user)) {
                            value = null;
                            break;
                        }
                        value = await message.client.users.fetch(contentArray[arg.index].replace(/[\\<>@#&!]/g, '')).catch(() => null);
                        break;
                    case 'channel':
                        if (!contentArray[arg.index].match(regex.channel)) {
                            value = null;
                            break;
                        }
                        value = await message.guild?.channels.fetch(contentArray[arg.index].replace(/[\\<>@#&!]/g, '')).catch(() => null);
                        break;
                    case 'role':
                        if (!contentArray[arg.index].match(regex.role)) {
                            value = null;
                            break;
                        }
                        value = await message.guild?.roles.fetch(contentArray[arg.index].replace(/[\\<>@#&!]/g, '')).catch(() => null);
                        break;
                    case 'string':
                        value = contentArray.slice(arg.index, arg.index + arg.length).filter(str => !this.commandHandler?.flagRegex.test(str)).join(' ');
                        break;
                    case 'integer':
                        value = parseInt(contentArray[arg.index]);
                        break;
                    case 'number':
                        value = parseFloat(contentArray[arg.index]);
                        break;
                    case 'boolean':
                        if (contentArray[arg.index] === 'true') {
                            value = (contentArray[arg.index] === 'true');
                            break;
                        }
                        if (contentArray[arg.index] === 'false') {
                            value = !(contentArray[arg.index] === 'false');
                            break;
                        }
                        value = null;
                        break;
                    case 'duration':
                        const stringOne = contentArray[arg.index];
                        const stringTwo = contentArray.slice(arg.index, arg.index + 2).join('');
                        value = parseDuration((regex.duration.test(stringOne) ? stringOne : regex.duration.test(stringTwo) ? stringTwo : null), new Date().getTime());
                        if (regex.duration.test(stringTwo))
                            contentArray.splice(arg.index, 1);
                        break;
                    case 'flag':
                        value = contentArray.find(str => this.commandHandler?.flagRegex.test(str)) ?? null;
                        if (value)
                            contentArray.splice(contentArray.indexOf(value), 1);
                        break;
                    default:
                        value = 'null';
                        break;
                }
            }
            else {
                value = null;
            }
            args[arg.id] = value;
            let test = i;
            test++;
            if (value === null && arg.optional && argumentArray[test])
                argumentArray[test].index = i;
            else
                argumentArray[i].index = i;
        }
        return args;
    }
    parseSlash(interaction, argumentArray) {
        const args = {};
        argumentArray.forEach(arg => {
            if (['user', 'channel', 'role'].includes(arg.type))
                return args[arg.id] = interaction.options.get(arg.id);
            return args[arg.id] = interaction.options.get(arg.id)?.value;
        });
        return args;
    }
    set clientSetter(client) {
        this.client = client;
        this.commandHandler = client.commandHandler;
    }
}
//# sourceMappingURL=Command.js.map