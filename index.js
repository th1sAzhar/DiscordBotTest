require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

client.once("clientReady", () => {
    console.log(`✅ Login sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    // Abaikan bot
    if (message.author.bot) return;

    // Hanya channel tertentu
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    // Hanya jika bot di-mention
    if (!message.mentions.has(client.user)) return;

    try {
        await message.channel.sendTyping();

        // Hilangkan mention bot dari pesan
        const prompt = message.content
            .replace(`<@${client.user.id}>`, "")
            .replace(`<@!${client.user.id}>`, "")
            .trim();

        if (!prompt) {
            return message.reply("Halo! Ada yang ingin ditanyakan? 😊");
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
Kamu adalah AI Discord bernama Prily Fitria Aziz AI.

Aturan:
- Jawab dalam Bahasa Indonesia kecuali diminta bahasa lain.
- Santai, jelas, dan membantu.
- Gunakan Markdown jika perlu.
- Jangan menyebut bahwa kamu adalah Gemini kecuali ditanya.

Pesan pengguna:
${prompt}
`
        });

        await message.reply(response.text);

    } catch (err) {
        console.error(err);
        await message.reply("⚠️ Terjadi kesalahan saat menghubungi AI.");
    }
});

client.login(process.env.DISCORD_TOKEN);