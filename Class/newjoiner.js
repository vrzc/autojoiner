const { EventEmitter } = require("node:events");
const {error} = require("./handleErrors")
const wait = require("node:timers/promises").setTimeout;
const {JsonDB, Config} = require("node-json-db");
let db = new JsonDB(new Config("stats", true, false, '/'));
const onWinSet = new Set();


class Joiner {
    constructor(client) {this.client = client;}
    #server() {
        console.log(`This Code was made by Sphinx, Discord: "3yl". If you see this on a repl.it project please report to me so i can deal with it.`)
    };
    /**
     * Auto Reaction for user accounts
     * ```js
     * const Discord = require("discord.js-selfbot-v13");
     * const client = new Discord.Client();
     * const sphinx = require("sphinx-self");
     * new sphinx.Core(client).autoReaction(options if any);
     * ```
     * @param {string} sessionid - SessionID. Don't change if you don't know what that is
     * @param {Array} customBotId - An Array of customBot ID's
     * @param {string} reactionName - Don't change if you don't understand what that is.
     * @param {number} timeout - The timeout between each giveaway
     * @param {Array} blacklistedwords - Black Listed words to not join the giveaway if the words exists in the giveaway embed.
     * @returns {void}
     * @author Sphinx
     */
    async autoReaction(options = {}) {
        const { sessionid = '636e16489c6fd773fbb37bdb212ecf3a', customBotId, reactionName, timeout = 5000, blacklistedwords = [], ownerId } = options;
        this.#server()
        if(!Array.isArray(blacklistedwords)) return console.error(new error('syntax', 'blacklistedwords must be an array'));
        if(customBotId) {
            if(!Array.isArray(customBotId)) return console.error(new error('syntax', 'customBotId must be an array filled with bot id\'s'))
            if(customBotId?.includes(message.author.id)) {
                if(message.content.includes(this.client.user?.id)) {
                    let serverInv = await message.guild?.invites.create(message.channel.id)
                    onWinSet.forEach(d => {
                        console.log(d.d.bot)
                        if(d.d.bot === message.author.id) {
                            onWinSet.delete(d)
                            console.log(onWinSet)

                        }
                    })
                    if(await db.exists('/wins')) {
                        await db.push('/wins', (await db.getData('/wins') + 1))
                    } else {
                        await db.push('/wins', 1)
                    }
                    eventEmitter.emit("wins", { data : message, owner: ownerId, inv: serverInv })
                } 
                if(message.components[0]) {
                    if(!message.embeds[0]) return;
                    if(message.content.startsWith('Congratulations')) return;
                    if(!message.components[0]) return;
                    //Checking if the embed is a giveaway embed;
                    if(blacklistedwords.includes(message.embeds[0]?.title)) return;
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
                            message_flage: 0,
                            message_id: message.id,
                            type: 3,
                            session_id: sessionid
                        }),
                        headers:{
                            "Authorization": this.client.token,
                            "Content-Type": 'application/json'
                        }
                    }).then(async data => {
                        const giveawayData = {url: message.url, otherData: message.embeds[0], bot: message.author.id}
                        eventEmitter.emit("giveawayCreated", giveawayData);
                        onWinSet.add({ d: { bot: message.author.id, embed: giveawayData.otherData}})

                        if(await db.exists('/joins')) {
                            await db.push('/joins', (await db.getData('/joins') + 1))
                        } else {
                            await db.push('/joins', 1)
                        }
                    })
                } else {
                if(blacklistedwords.includes(message.embeds[0]?.title)) return;
                if(!message.embeds[0]) return;
                await wait(timeout)
                message.reactions.cache.forEach(async react => {
                    if(reactionName) {
                        if(react._emoji.name !== reactionName) return;
                    }
                    message.react(react._emoji).then(async _ => {
                        const giveawayData = {url: message.url, otherData: message?.embeds[0], bot: message.author.id}
                        eventEmitter.emit('giveawayCreated', {url: message.url})
                        onWinSet.add({ d: { bot: message.author.id, embed: giveawayData.otherData}})

                        if(await db.exists('/joins')) {
                            await db.push('/joins', (await db.getData('/joins') + 1))
                        } else {
                            await db.push('/joins', 1)
                        }
                    
                    })
                })
                }
            }
        } else return;
    }
}



const eventEmitter = new EventEmitter();

module.exports = {Joiner, on: eventEmitter.on.bind(eventEmitter)}