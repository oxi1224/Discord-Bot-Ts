import 'dotenv/config';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { CommandHandler, CustomClient, TaskHandler, TimeInMs, ListenerHandler } from '#base';
import { Sequelize } from 'sequelize';
import { GuildConfig } from '../models/GuildConfig.js';
import { ExpiringPunishments } from '../models/ExpiringPunishments.js';
import { Modlogs } from '../models/Modlogs.js';


export class Client extends CustomClient {
  public db: Sequelize;
  public override commandHandler: CommandHandler;
  public override taskHandler: TaskHandler;
  public override listenerHandler: ListenerHandler;

  constructor() {
    super({
      intents: Object.keys(GatewayIntentBits)
        .map((i) => (typeof i === 'string' ? GatewayIntentBits[i as keyof typeof GatewayIntentBits] : i))
        .reduce((acc, p) => acc | p, 0)
    }, {
      owners: ['344452070360875008']
    });

    this.commandHandler = new CommandHandler(this, {
      commandExportFile: '../../commands/index.js', 
      prefix: '!',
      aliasReplacement: /-/g
    });

    this.taskHandler = new TaskHandler(this, {
      taskExportFile: '../../tasks/index.js',
      defaultInterval: TimeInMs.Minute * 1
    });

    this.db = new Sequelize(process.env.DATABASE_URL ?? '', {
      dialect: 'postgres',
      dialectOptions: { ssl: {
        require: true,
        rejectUnauthorized: false
      } },
      define: { timestamps: false },
      logging: false
    });

    this.listenerHandler = new ListenerHandler(this, {
      listenerExportFile: '../../listeners/index.js'
    });

    this.commandHandler.on('slashLoadStart', interaction => console.log(`Loading ${interaction.name} (/) command.`));
    this.commandHandler.on('slashLoadFinish', interaction => console.log(`${interaction.name} (/) command loaded.`));
    this.taskHandler.on('taskLoad', task => console.log(`${task.id} listener loaded.`));
    this.listenerHandler.on('listenerLoad', listener => console.log(`${listener.id} task loaded.`));
  }

  public async dbInit() {
    await this.db.authenticate();
    GuildConfig.initialize(this.db);
    ExpiringPunishments.initialize(this.db);
    Modlogs.initialize(this.db);
    await this.db.sync();
  }

  public async start() {
    await this.login(process.env.TOKEN ?? '');
    this.commandHandler.start();
    this.taskHandler.start();
    this.listenerHandler.start();
    await this.dbInit();
  }
}