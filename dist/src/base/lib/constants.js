import { SlashCommandBuilder } from 'discord.js';
export var TimeInMs;
(function (TimeInMs) {
    TimeInMs[TimeInMs["Milisecond"] = 1] = "Milisecond";
    TimeInMs[TimeInMs["Second"] = 1000] = "Second";
    TimeInMs[TimeInMs["Minute"] = 60000] = "Minute";
    TimeInMs[TimeInMs["Hour"] = 3600000] = "Hour";
    TimeInMs[TimeInMs["Day"] = 86400000] = "Day";
    TimeInMs[TimeInMs["Week"] = 604800000] = "Week";
    TimeInMs[TimeInMs["Month"] = 2678400000] = "Month";
})(TimeInMs || (TimeInMs = {}));
export var DurationString;
(function (DurationString) {
    DurationString["min"] = "Minute";
    DurationString["minute"] = "Minute";
    DurationString["minutes"] = "Minute";
    DurationString["h"] = "Hour";
    DurationString["hour"] = "Hour";
    DurationString["hours"] = "Hour";
    DurationString["d"] = "Day";
    DurationString["day"] = "Day";
    DurationString["days"] = "Day";
    DurationString["w"] = "Week";
    DurationString["week"] = "Week";
    DurationString["weeks"] = "Week";
    DurationString["m"] = "Month";
    DurationString["month"] = "Month";
    DurationString["months"] = "Month";
})(DurationString || (DurationString = {}));
export const regex = {
    user: /<@\d{6,18}>/,
    channel: /<#\d{6,18}>/,
    role: /<@!\d{6,18}>/,
    snowflake: /<[\\@#&!]+\d{6,18}>/,
    duration: /^\d+(min|minute|minutes|h|hour|hours|d|day|days|w|week|weeks|m|month|months)$/i,
};
export const slashOptions = {
    '3': (slashCommand, arg) => slashCommand.addStringOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '4': (slashCommand, arg) => slashCommand.addIntegerOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '5': (slashCommand, arg) => slashCommand.addBooleanOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '6': (slashCommand, arg) => slashCommand.addUserOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '7': (slashCommand, arg) => slashCommand.addChannelOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '8': (slashCommand, arg) => slashCommand.addRoleOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
    '10': (slashCommand, arg) => slashCommand.addNumberOption(option => option.setName(arg.id)
        .setDescription(arg.description ?? '')
        .setRequired(!arg.optional)),
};
//# sourceMappingURL=constants.js.map