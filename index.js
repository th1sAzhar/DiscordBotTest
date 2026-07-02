require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    PermissionFlagsBits
} = require("discord.js");

const { GoogleGenAI } = require("@google/genai");

const {
    setGuildChannel,
    getGuild
} = require("./utils/guildConfig");

const {
    getUserHistory,
    addMessage
} = require("./utils/history");

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent

    ]

});

const ai = new GoogleGenAI({

    apiKey: process.env.GEMINI_API_KEY

});

client.once("clientReady", () => {

    console.log(`✅ Login sebagai ${client.user.tag}`);

});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (!message.guild) return;

    // =============================
    // Setup Channel
    // =============================

    if (message.content === "!setup-ai") {

        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {

            return message.reply(
                "❌ Hanya Administrator yang dapat melakukan setup."
            );

        }

        setGuildChannel(
            message.guild.id,
            message.channel.id
        );

        return message.reply(
            "✅ Channel AI berhasil disimpan."
        );

    }

    // =============================
    // Cek Config
    // =============================

    const guildConfig = getGuild(message.guild.id);

    if (!guildConfig)
        return;

    if (guildConfig.channelId !== message.channel.id)
        return;

    // =============================
    // Harus mention bot
    // =============================

    if (!message.mentions.has(client.user))
        return;

    const prompt = message.content
        .replace(`<@${client.user.id}>`, "")
        .replace(`<@!${client.user.id}>`, "")
        .trim();

    if (!prompt) {

        return message.reply(
            "Halo! Ada yang ingin ditanyakan?"
        );

    }

    try {

        await message.channel.sendTyping();

        const history = getUserHistory(

            message.guild.id,
            message.author.id

        );

        const historyText = history
            .map(msg => `${msg.role}: ${msg.text}`)
            .join("\n");

        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: `
Kamu adalah AI Discord bernama Prily Fitria Aziz AI.

Aturan:

- Jawab dalam Bahasa Indonesia kecuali diminta bahasa lain.
- Santai.
- Ramah.
- Membantu.
- Jangan pernah menyebut bahwa kamu adalah Gemini.

Riwayat Percakapan:

${historyText}

User:

${prompt}
`

        });

        addMessage(

            message.guild.id,
            message.author.id,
            "user",
            prompt

        );

        addMessage(

            message.guild.id,
            message.author.id,
            "assistant",
            response.text

        );

        await message.reply(response.text);

    }

    catch (err) {

        console.error(err);

        message.reply(
            "⚠️ Terjadi kesalahan saat menghubungi AI."
        );

    }

});

client.login(process.env.DISCORD_TOKEN);