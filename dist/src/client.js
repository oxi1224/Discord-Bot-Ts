import 'dotenv/config';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { CommandHandler, CustomClient, TaskHandler, TimeInMs } from '#base';
export class Client extends CustomClient {
    constructor() {
        super({
            intents: Object.keys(GatewayIntentBits)
                .map((i) => (typeof i === 'string' ? GatewayIntentBits[i] : i))
                .reduce((acc, p) => acc | p, 0)
        }, {
            owners: ['344452070360875008'],
            specialUsers: ['344452070360875008']
        });
        this.commandHandler = new CommandHandler(this, {
            commandExportFile: '../../commands/index.js',
            prefix: '!',
            aliasReplacement: /-/g
        });
        this.taskHandler = new TaskHandler(this, {
            taskExportFile: '../../tasks/index.js',
            defaultCooldown: TimeInMs.Minute * 1
        });
        this.commandHandler.start();
        this.commandHandler.on('slashLoadStart', interaction => console.log(`Loading ${interaction.name} (/) command.`));
        this.commandHandler.on('slashLoadFinish', interaction => console.log(`Successfully loaded ${interaction.name} (/) command.`));
        this.taskHandler.start();
        this.taskHandler.on('taskLoad', task => console.log(`${task.id} task loaded.`));
    }
}
export const client = new Client();
client.login(process.env.TOKEN);
//# sourceMappingURL=client.js.map