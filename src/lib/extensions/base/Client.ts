import 'dotenv/config';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { CustomClient, TimeInMs } from '#base';
import { Sequelize } from 'sequelize';
import { GuildConfig, GuildConfigModel } from '../../models/GuildConfig.js';
import { ExpiringPunishments } from '../../models/ExpiringPunishments.js';
import { Modlogs } from '../../models/Modlogs.js';
import { CommandHandler } from './CommandHandler.js';
import { TaskHandler } from './TaskHandler.js';
import { ListenerHandler } from './ListenerHandler.js';
import { type Snowflake } from 'discord.js';

export class Client extends CustomClient {
  public db: Sequelize;
  public guildConfigCache: Map<Snowflake, GuildConfigModel> = new Map();
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
      aliasReplacement: /-/g,
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

    this.commandHandler.on('slashInit', interaction => console.log(`Initialized ${interaction.name} (/) command.`));
    this.commandHandler.on('slashLoad', () => console.log('All (/) commands loaded.'));
    this.taskHandler.on('taskLoad', task => console.log(`${task.id} task loaded.`));
    this.listenerHandler.on('listenerLoad', listener => console.log(`${listener.id} listener loaded.`));
  }

  public async dbInit() {
    await this.db.authenticate();
    GuildConfig.initialize(this.db);
    ExpiringPunishments.initialize(this.db);
    Modlogs.initialize(this.db);
    await this.db.sync({ alter: true });
  }

  public async start() {
    if (!process.env.TOKEN) this.destroy();
    await this.dbInit();
    this.commandHandler.start();
    this.taskHandler.start();
    this.listenerHandler.start();
    this.login(process.env.TOKEN);
  }

  public async cacheGuildConfig(guildId: Snowflake) {
    const guildConfig = await GuildConfig.findByPk(guildId) ?? await GuildConfig.create({ id: guildId });
    this.guildConfigCache.set(guildId, guildConfig);
  }
}