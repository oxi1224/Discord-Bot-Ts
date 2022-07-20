import { Client } from 'discord.js';
import { CommandHandler } from './command/CommandHandler.js';
import { TaskHandler } from './task/TaskHandler.js';
export class CustomClient extends Client {
    owners;
    specialUsers;
    commandHandler;
    taskHandler;
    constructor(clientOptions, { owners = [], specialUsers = [] }) {
        super(clientOptions);
        this.owners = owners;
        this.specialUsers = specialUsers;
    }
    isOwner(user) {
        const id = this.users.resolveId(user);
        return this.owners.includes(id ?? '');
    }
    isSpecial(user) {
        const id = this.users.resolveId(user);
        return this.specialUsers.includes(id ?? '');
    }
}
//# sourceMappingURL=CustomClient.js.map