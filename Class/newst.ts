import { EventEmitter } from 'events';
import { error } from './handleErrors';
import { setTimeout as wait } from 'timers/promises';
import { JsonDB, Config } from 'node-json-db';
import fetch from 'node-fetch';
import { Message } from 'discord.js-selfbot-v13';

interface AutoReactionOptions {
    sessionid?: string;
    customBotId?: string[];
    reactionName?: string;
    timeout?: number;
    blacklistedwords?: string[];
    ownerId?: string;
}

const onWinSet = new Set();

class Joiner {
    private client: any;
    private db: JsonDB;
    public eventEmitter: EventEmitter;

    constructor(client: any) {
        this.client = client;
        this.db = new JsonDB(new Config("stats", true, false, '/'));
        this.eventEmitter = new EventEmitter();
    }

    #server() {
        console.log(`This Code was made by Sphinx, Discord: "3yl". If you see this on a repl.it project please report to me so I can deal with it.`);
    }

    async autoReaction(options: AutoReactionOptions = {}) {
        const {
            sessionid = process.env.SESSION_ID,
            customBotId,
            reactionName,
            timeout = 5000,
            blacklistedwords = [],
            ownerId
        } = options;
        this.#server();

        if (!Array.isArray(blacklistedwords)) {
            return console.error(new error('syntax', 'blacklistedwords must be an array'));
        }
        if (customBotId && !Array.isArray(customBotId)) {
            return console.error(new error('syntax', 'customBotId must be an array filled with bot IDs'));
        }

        this.client.on("messageCreate", async (message: Message) => {
            if (customBotId?.includes(message.author.id)) {
                if (message.content.includes(this.client.user?.id)) {
                    let serverInv = await message.guild?.invites.create(message.channel.id);
                    onWinSet.forEach((d) => {
                        if ((d as any).d.bot === message.author.id) {
                            onWinSet.delete(d);
                        }
                    });
                    if (await this.db.exists('/wins')) {
                        await this.db.push('/wins', (await this.db.getData('/wins') + 1));
                    } else {
                        await this.db.push('/wins', 1);
                    }
                    this.eventEmitter.emit("wins", { data: message, owner: ownerId, inv: serverInv });
                }
                if (message.components[0]) {
                    if (!message.embeds[0] || message.content.startsWith('Congratulations') || blacklistedwords.includes(message.embeds[0]?.title as string)) return;

                    await wait(timeout);
                    await fetch('https://discord.com/api/v9/interactions', {
                        method: 'POST',
                        body: JSON.stringify({
                            application_id: message.author.id,
                            channel_id: message.channel.id,
                            data: {
                                component_type: 2,
                                custom_id: message.components[0].components[0].customId
                            },
                            guild_id: message.guild?.id,
                            message_flags: 0,
                            message_id: message.id,
                            type: 3,
                            session_id: sessionid
                        }),
                        headers: {
                            "Authorization": this.client.token,
                            "Content-Type": 'application/json'
                        }
                    }).then(async () => {
                        const giveawayData = { url: message.url, otherData: message.embeds[0], bot: message.author.id };
                        this.eventEmitter.emit("giveawayCreated", giveawayData);
                        onWinSet.add({ d: { bot: message.author.id, embed: giveawayData.otherData } });

                        if (await this.db.exists('/joins')) {
                            await this.db.push('/joins', (await this.db.getData('/joins') + 1));
                        } else {
                            await this.db.push('/joins', 1);
                        }
                    });
                } else {
                    if (!message.embeds[0] || blacklistedwords.includes(message.embeds[0]?.title as string)) return;

                    await wait(timeout);
                    message.reactions.cache.forEach(async react => {
                        
                        if (reactionName && react.emoji.name !== reactionName) return;

                        await message.react(react.emoji);
                        const giveawayData = { url: message.url, otherData: message?.embeds[0], bot: message.author.id };
                        this.eventEmitter.emit('giveawayCreated', giveawayData);
                        onWinSet.add({ d: { bot: message.author.id, embed: giveawayData.otherData } });

                        if (await this.db.exists('/joins')) {
                            await this.db.push('/joins', (await this.db.getData('/joins') + 1));
                        } else {
                            await this.db.push('/joins', 1);
                        }
                    });
                }
            }
        });
    }
}

export { Joiner };
